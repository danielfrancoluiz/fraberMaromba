/**
 * Copia dados do banco DEV (.env.local) para PRD (.env.production.local).
 * Schema já deve existir no PRD. Não sobrescreve _prisma_migrations.
 *
 * Uso: node scripts/copy-dev-to-prd.mjs
 */
import fs from "fs";
import path from "path";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Client } = pg;
const ROOT = process.cwd();

function parseEnv(filePath) {
  const out = {};
  const full = path.join(ROOT, filePath);
  if (!fs.existsSync(full)) throw new Error(`Arquivo não encontrado: ${filePath}`);
  for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return out;
}

const SKIP_TABLES = new Set(["_prisma_migrations"]);

async function listTables(client) {
  const { rows } = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  return rows.map((r) => r.tablename).filter((t) => !SKIP_TABLES.has(t));
}

async function countRows(client, table) {
  const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
  return rows[0].n;
}

async function copyTable(dev, prd, table) {
  const { rows } = await dev.query(`SELECT * FROM "${table}"`);
  if (rows.length === 0) {
    console.log(`  ${table}: 0 rows`);
    return 0;
  }

  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;

  let inserted = 0;
  for (const row of rows) {
    const values = cols.map((c) => row[c]);
    try {
      await prd.query(sql, values);
      inserted += 1;
    } catch (err) {
      console.error(`  ERRO ${table}:`, err.message.split("\n")[0]);
      throw err;
    }
  }
  console.log(`  ${table}: ${inserted} rows`);
  return inserted;
}

async function truncateAll(prd, tables) {
  if (tables.length === 0) return;
  const list = tables.map((t) => `"${t}"`).join(", ");
  await prd.query(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
  console.log(`TRUNCATE ${tables.length} tabelas (CASCADE)`);
}

async function copyStorage(devEnv, prdEnv) {
  const bucket = "exercicios-midia";
  const devSb = createClient(
    devEnv.NEXT_PUBLIC_SUPABASE_URL,
    devEnv.SUPABASE_SERVICE_ROLE_KEY
  );
  const prdSb = createClient(
    prdEnv.NEXT_PUBLIC_SUPABASE_URL,
    prdEnv.SUPABASE_SERVICE_ROLE_KEY
  );

  // Garante bucket no PRD
  const { data: buckets } = await prdSb.storage.listBuckets();
  if (!buckets?.some((b) => b.name === bucket)) {
    const { error } = await prdSb.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
    });
    if (error && !/already exists|duplicate/i.test(error.message)) {
      throw new Error(`Bucket PRD: ${error.message}`);
    }
    console.log(`Bucket ${bucket} criado no PRD`);
  }

  async function listAll(prefix = "") {
    const { data, error } = await devSb.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset: 0,
    });
    if (error) throw new Error(`list ${prefix}: ${error.message}`);
    const files = [];
    for (const item of data ?? []) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      // pasta: id sem metadata.size tipicamente
      if (item.id === null || (item.metadata == null && !item.metadata?.size)) {
        // pode ser pasta — tenta listar filhos
        const children = await listAll(full);
        if (children.length > 0) {
          files.push(...children);
          continue;
        }
      }
      if (item.metadata || item.id) {
        files.push(full);
      }
    }
    return files;
  }

  // list raiz (pastas por professorId)
  const { data: root, error: rootErr } = await devSb.storage.from(bucket).list("", {
    limit: 1000,
  });
  if (rootErr) throw new Error(rootErr.message);

  const paths = [];
  for (const item of root ?? []) {
    const name = item.name;
    // pasta de professor
    const { data: kids, error } = await devSb.storage.from(bucket).list(name, {
      limit: 1000,
    });
    if (error) {
      console.warn(`  skip pasta ${name}: ${error.message}`);
      continue;
    }
    for (const kid of kids ?? []) {
      if (kid.name) paths.push(`${name}/${kid.name}`);
    }
  }

  console.log(`Storage DEV: ${paths.length} arquivos`);
  let ok = 0;
  let fail = 0;

  for (const objectPath of paths) {
    const { data: blob, error: dlErr } = await devSb.storage
      .from(bucket)
      .download(objectPath);
    if (dlErr || !blob) {
      console.warn(`  download fail ${objectPath}: ${dlErr?.message}`);
      fail += 1;
      continue;
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    const contentType = blob.type || "application/octet-stream";
    const { error: upErr } = await prdSb.storage.from(bucket).upload(objectPath, buffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) {
      console.warn(`  upload fail ${objectPath}: ${upErr.message}`);
      fail += 1;
      continue;
    }
    ok += 1;
  }

  console.log(`Storage PRD: ${ok} ok, ${fail} falhas`);
}

async function main() {
  const devEnv = parseEnv(".env.local");
  const prdEnv = parseEnv(".env.production.local");

  const dev = new Client({
    connectionString: devEnv.DIRECT_URL || devEnv.DATABASE_URL,
    connectionTimeoutMillis: 20000,
  });
  const prd = new Client({
    connectionString: prdEnv.DIRECT_URL || prdEnv.DATABASE_URL,
    connectionTimeoutMillis: 20000,
  });

  console.log("Conectando DEV e PRD...");
  await dev.connect();
  await prd.connect();

  const tables = await listTables(dev);
  console.log(`Tabelas: ${tables.join(", ")}`);

  console.log("\nContagens DEV:");
  for (const t of tables) {
    console.log(`  ${t}: ${await countRows(dev, t)}`);
  }

  console.log("\nLimpando PRD e copiando dados...");
  await truncateAll(prd, tables);

  // Ordem: tabelas sem FK primeiro — TRUNCATE CASCADE já limpou;
  // insert pode falhar por FK se ordem errada. Preferir desabilitar triggers.
  await prd.query("SET session_replication_role = replica");
  try {
    for (const t of tables) {
      await copyTable(dev, prd, t);
    }
  } finally {
    await prd.query("SET session_replication_role = DEFAULT");
  }

  console.log("\nContagens PRD:");
  for (const t of tables) {
    console.log(`  ${t}: ${await countRows(prd, t)}`);
  }

  await dev.end();
  await prd.end();

  console.log("\nCopiando Storage...");
  await copyStorage(devEnv, prdEnv);

  console.log("\nConcluído: DEV → PRD.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
