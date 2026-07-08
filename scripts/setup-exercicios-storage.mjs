/**
 * Cria bucket público para mídia de exercícios no Supabase Storage.
 * Tenta API (service role); se não houver chave, usa SQL via DATABASE_URL.
 * Execute: npm run storage:setup
 */
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const bucket = "exercicios-midia";
const mimeTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/gif",
  "image/webp",
  "image/jpeg",
  "image/png",
];

async function viaApi() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;

  const supabase = createClient(url, serviceKey);
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(listError.message);

  if (buckets.some((b) => b.name === bucket)) {
    console.log(`Bucket "${bucket}" já existe (API).`);
    return true;
  }

  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: mimeTypes,
  });

  if (error) throw new Error(error.message);
  console.log(`Bucket "${bucket}" criado com sucesso (API).`);
  return true;
}

async function viaSql() {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) {
    throw new Error("Defina DATABASE_URL ou DIRECT_URL no .env.local");
  }

  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(
      `
      insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      values ($1, $1, true, $2, $3::text[])
      on conflict (id) do update set
        public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types
    `,
      [bucket, 50 * 1024 * 1024, mimeTypes]
    );

    const { rows } = await client.query(
      "select id, name, public from storage.buckets where id = $1",
      [bucket]
    );
    console.log(`Bucket "${bucket}" configurado (SQL):`, rows[0]);
  } finally {
    await client.end();
  }
}

try {
  const okApi = await viaApi();
  if (!okApi) {
    console.log("SUPABASE_SERVICE_ROLE_KEY ausente — usando SQL...");
    await viaSql();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
