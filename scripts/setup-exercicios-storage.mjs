/**
 * Cria bucket público para mídia de exercícios no Supabase Storage.
 * Execute uma vez: node scripts/setup-exercicios-storage.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = "exercicios-midia";

if (!url || !serviceKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("Erro ao listar buckets:", listError.message);
  process.exit(1);
}

if (buckets.some((b) => b.name === bucket)) {
  console.log(`Bucket "${bucket}" já existe.`);
  process.exit(0);
}

const { error } = await supabase.storage.createBucket(bucket, {
  public: true,
  fileSizeLimit: 50 * 1024 * 1024,
  allowedMimeTypes: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "image/gif",
    "image/webp",
    "image/jpeg",
    "image/png",
  ],
});

if (error) {
  console.error("Erro ao criar bucket:", error.message);
  process.exit(1);
}

console.log(`Bucket "${bucket}" criado com sucesso (público).`);
