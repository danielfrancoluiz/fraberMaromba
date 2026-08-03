import {
  BUCKET_EXERCICIOS_MIDIA,
  resolverMimeMidia,
  validarArquivoMidia,
} from "@/lib/exercicio-midia";
import { getSupabase } from "@/lib/supabase";

interface UploadAssinadoResponse {
  path: string;
  token: string;
  signedUrl: string;
  publicUrl: string;
  contentType: string;
  error?: string;
}

function mensagemErroResposta(res: Response, body: unknown, fallback: string): string {
  if (res.status === 413) {
    return "Arquivo muito grande para o servidor. Tente um vídeo menor (até 50 MB).";
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error?: string }).error === "string"
  ) {
    return (body as { error: string }).error;
  }

  return fallback;
}

/**
 * 1) API gera URL assinada (JSON leve)
 * 2) Browser envia o arquivo direto ao Supabase Storage
 */
export async function uploadMidiaExercicioProfessor(file: File): Promise<string> {
  const erroLocal = validarArquivoMidia(file);
  if (erroLocal) throw new Error(erroLocal);

  const contentType = resolverMimeMidia(file);

  const res = await fetch("/api/professor/exercicios/upload", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      size: file.size,
    }),
  });

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      mensagemErroResposta(res, body, "Erro ao preparar envio do arquivo")
    );
  }

  const signed = body as UploadAssinadoResponse;
  if (!signed.path || !signed.token || !signed.publicUrl) {
    throw new Error("Resposta inválida ao preparar upload");
  }

  const { error } = await getSupabase().storage
    .from(BUCKET_EXERCICIOS_MIDIA)
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType: signed.contentType || contentType,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`Falha no upload: ${error.message}`);
  }

  return signed.publicUrl;
}
