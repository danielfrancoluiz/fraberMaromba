import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const BUCKET_EXERCICIOS_MIDIA = "exercicios-midia";

export const MAX_MIDIA_BYTES = 50 * 1024 * 1024;

const EXT_POR_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export function extensaoMidiaPermitida(mime: string): string | null {
  return EXT_POR_MIME[mime.toLowerCase()] ?? null;
}

export function validarArquivoMidia(file: File): string | null {
  if (file.size <= 0) return "Arquivo vazio";
  if (file.size > MAX_MIDIA_BYTES) {
    return "Arquivo muito grande (máximo 50 MB)";
  }

  const ext = extensaoMidiaPermitida(file.type);
  if (!ext) {
    return "Formato não suportado. Use MP4, WebM, MOV, GIF, WebP, JPG ou PNG";
  }

  return null;
}

let bucketGarantido = false;

export async function garantirBucketExerciciosMidia(): Promise<void> {
  if (bucketGarantido) return;

  const { error } = await getSupabaseAdmin().storage.createBucket(BUCKET_EXERCICIOS_MIDIA, {
    public: true,
    fileSizeLimit: MAX_MIDIA_BYTES,
    allowedMimeTypes: Object.keys(EXT_POR_MIME),
  });

  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw new Error(`Não foi possível preparar o storage: ${error.message}`);
  }

  bucketGarantido = true;
}

export function caminhoMidiaExercicio(professorId: string, extensao: string): string {
  return `${professorId}/${randomUUID()}.${extensao}`;
}

export function urlPublicaMidia(caminho: string): string {
  const { data } = getSupabaseAdmin().storage
    .from(BUCKET_EXERCICIOS_MIDIA)
    .getPublicUrl(caminho);

  return data.publicUrl;
}

export async function enviarMidiaExercicio(
  file: File,
  professorId: string
): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Storage não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const erroValidacao = validarArquivoMidia(file);
  if (erroValidacao) throw new Error(erroValidacao);

  const ext = extensaoMidiaPermitida(file.type)!;
  await garantirBucketExerciciosMidia();

  const caminho = caminhoMidiaExercicio(professorId, ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabaseAdmin().storage
    .from(BUCKET_EXERCICIOS_MIDIA)
    .upload(caminho, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`Falha no upload: ${error.message}`);
  }

  return urlPublicaMidia(caminho);
}
