import { randomUUID } from "crypto";
import {
  BUCKET_EXERCICIOS_MIDIA,
  MAX_MIDIA_BYTES,
  extensaoMidiaPermitida,
  mimesMidiaPermitidos,
  resolverMimeMidia,
  validarArquivoMidia,
} from "@/lib/exercicio-midia";
import { getSupabaseAdmin } from "@/lib/supabase";

export {
  BUCKET_EXERCICIOS_MIDIA,
  MAX_MIDIA_BYTES,
  extensaoMidiaPermitida,
  resolverMimeMidia,
  validarArquivoMidia,
} from "@/lib/exercicio-midia";

let bucketGarantido = false;

export async function garantirBucketExerciciosMidia(): Promise<void> {
  if (bucketGarantido) return;

  const { error } = await getSupabaseAdmin().storage.createBucket(BUCKET_EXERCICIOS_MIDIA, {
    public: true,
    fileSizeLimit: MAX_MIDIA_BYTES,
    allowedMimeTypes: mimesMidiaPermitidos(),
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

export interface UploadAssinadoExercicio {
  path: string;
  token: string;
  signedUrl: string;
  publicUrl: string;
  contentType: string;
}

/**
 * Gera URL assinada para o browser enviar o arquivo direto ao Supabase,
 * evitando o limite de body das funções serverless (~4,5 MB na Vercel).
 */
export async function criarUploadAssinadoExercicio(
  professorId: string,
  file: Pick<File, "type" | "name" | "size">
): Promise<UploadAssinadoExercicio> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Storage não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const erroValidacao = validarArquivoMidia(file);
  if (erroValidacao) throw new Error(erroValidacao);

  const contentType = resolverMimeMidia(file);
  const ext = extensaoMidiaPermitida(contentType)!;
  await garantirBucketExerciciosMidia();

  const path = caminhoMidiaExercicio(professorId, ext);
  const { data, error } = await getSupabaseAdmin().storage
    .from(BUCKET_EXERCICIOS_MIDIA)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Falha ao preparar upload: ${error?.message ?? "resposta vazia"}`);
  }

  return {
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: urlPublicaMidia(data.path),
    contentType,
  };
}
