/**
 * Diagnóstico de conexão Supabase (P1000 / P1001).
 * Uso: node scripts/db-connection-check.cjs
 */
require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

const dns = require("dns").promises;
const net = require("net");
const { Pool } = require("pg");

const URL_KEYS = [
  "DIRECT_URL",
  "DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
];

function parseMeta(connectionString) {
  if (!connectionString?.trim()) return null;
  try {
    const url = new URL(connectionString.replace(/^postgresql:/i, "postgres:"));
    return {
      host: url.hostname,
      port: url.port || "5432",
      user: decodeURIComponent(url.username),
      hasPassword: url.password.length > 0,
      isPooler: url.hostname.includes("pooler.supabase.com"),
      isDirectDb: url.hostname.startsWith("db.") && url.hostname.endsWith(".supabase.co"),
    };
  } catch {
    return null;
  }
}

async function dnsInfo(host) {
  const out = { host, ipv4: [], ipv6: [] };
  try {
    out.ipv4 = await dns.resolve4(host);
  } catch {
    /* sem A */
  }
  try {
    out.ipv6 = await dns.resolve6(host);
  } catch {
    /* sem AAAA */
  }
  return out;
}

function tcpProbe(host, port, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: Number(port), family: 4 }, () => {
      socket.destroy();
      resolve({ ok: true, family: 4 });
    });
    socket.setTimeout(timeoutMs);
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ ok: false, error: "timeout" });
    });
    socket.on("error", (err) => {
      socket.destroy();
      resolve({ ok: false, error: err.code || err.message });
    });
  });
}

async function pgProbe(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12_000,
    max: 1,
  });
  try {
    await pool.query("SELECT 1");
    return { ok: true };
  } catch (err) {
    return { ok: false, code: err.code, message: err.message };
  } finally {
    await pool.end().catch(() => {});
  }
}

async function main() {
  console.log("=== FRABER — diagnóstico de banco ===\n");

  for (const key of URL_KEYS) {
    const raw = process.env[key];
    const meta = parseMeta(raw);
    if (!meta) {
      console.log(`${key}: (não definida)\n`);
      continue;
    }

    console.log(`${key}:`);
    console.log(`  host: ${meta.host}:${meta.port}`);
    console.log(`  user: ${meta.user}`);
    console.log(`  pooler: ${meta.isPooler ? "sim" : "não"}`);
    console.log(`  direct db.*: ${meta.isDirectDb ? "sim" : "não"}`);

    const records = await dnsInfo(meta.host);
    console.log(`  DNS IPv4: ${records.ipv4.length ? records.ipv4.join(", ") : "nenhum"}`);
    console.log(`  DNS IPv6: ${records.ipv6.length ? records.ipv6.length + " endereço(s)" : "nenhum"}`);

    if (records.ipv4.length === 0 && records.ipv6.length > 0) {
      console.log(
        "  ⚠ Host só IPv6 — comum causar P1001 no Windows/rede sem IPv6."
      );
    }

    const tcp = await tcpProbe(
      records.ipv4[0] || meta.host,
      meta.port
    );
    console.log(`  TCP (IPv4): ${tcp.ok ? "OK" : "falhou — " + (tcp.error || "?")}`);

    if (raw && meta.hasPassword) {
      const pg = await pgProbe(raw);
      console.log(
        `  PostgreSQL: ${pg.ok ? "OK" : `falhou — ${pg.code || ""} ${pg.message || ""}`.trim()}`
      );
    } else {
      console.log("  PostgreSQL: (sem senha na URL — pulado)");
    }
    console.log("");
  }

  console.log("--- Próximos passos se P1001 ---");
  console.log(
    "1. Supabase → Project Settings → Database → Connection string"
  );
  console.log(
    '2. Modo "Session pooler" (porta 5432) — host aws-0-*.pooler.supabase.com'
  );
  console.log(
    "3. Usuário: postgres.SEU_PROJECT_REF (não só postgres)"
  );
  console.log("4. Cole em DIRECT_URL no .env.local e rode: npx prisma db push");
  console.log(
    "5. Ou ative IPv4 add-on no Supabase para usar db.*.supabase.co direto.\n"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
