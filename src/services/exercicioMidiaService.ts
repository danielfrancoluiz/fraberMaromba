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

export interface MidiaExercicioUpload {
  /** Arquivo original: vídeo, GIF ou imagem. */
  gifUrl: string;
  /** JPEG estático para listas; igual ao original quando já é imagem. */
  imagemUrl: string;
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

async function uploadArquivoAssinado(file: File): Promise<string> {
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
      // O path usa UUID e nunca é sobrescrito: cache de 1 ano evita novos
      // downloads do mesmo poster/vídeo no navegador do aluno.
      cacheControl: "31536000",
    });

  if (error) {
    throw new Error(`Falha no upload: ${error.message}`);
  }

  return signed.publicUrl;
}

function aguardarEvento(
  alvo: HTMLVideoElement,
  evento: "loadeddata" | "seeked"
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("Tempo esgotado ao gerar miniatura")),
      12_000
    );
    const limpar = () => window.clearTimeout(timeout);
    alvo.addEventListener(
      evento,
      () => {
        limpar();
        resolve();
      },
      { once: true }
    );
    alvo.addEventListener(
      "error",
      () => {
        limpar();
        reject(new Error("Não foi possível ler o vídeo"));
      },
      { once: true }
    );
  });
}

/** Captura localmente um frame; não consome egress do Storage. */
async function criarPosterVideo(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    const carregado = aguardarEvento(video, "loadeddata");
    video.src = objectUrl;
    await carregado;

    const destino = Math.min(
      0.15,
      Number.isFinite(video.duration) && video.duration > 0
        ? video.duration * 0.02
        : 0.1
    );
    if (destino > 0 && Math.abs(video.currentTime - destino) > 0.01) {
      const posicionado = aguardarEvento(video, "seeked");
      video.currentTime = destino;
      await posicionado;
    }

    const larguraOriginal = video.videoWidth;
    const alturaOriginal = video.videoHeight;
    if (!larguraOriginal || !alturaOriginal) {
      throw new Error("Vídeo sem dimensões válidas");
    }

    const largura = Math.min(640, larguraOriginal);
    const altura = Math.max(
      1,
      Math.round((alturaOriginal / larguraOriginal) * largura)
    );
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível");
    ctx.drawImage(video, 0, 0, largura, altura);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (resultado) =>
          resultado
            ? resolve(resultado)
            : reject(new Error("Falha ao gerar JPEG")),
        "image/jpeg",
        0.78
      );
    });
    const base = file.name.replace(/\.[^.]+$/, "") || "exercicio";
    return new File([blob], `${base}-poster.jpg`, { type: "image/jpeg" });
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Envia o original e, para vídeos, cria e envia um poster JPEG estático.
 * A captura usa o File local antes do upload, sem baixar o vídeo do Storage.
 */
export async function uploadMidiaExercicioProfessor(
  file: File
): Promise<MidiaExercicioUpload> {
  const contentType = resolverMimeMidia(file);
  const video = contentType.startsWith("video/");
  let poster: File | null = null;
  if (video) {
    try {
      poster = await criarPosterVideo(file);
    } catch {
      // Alguns browsers não decodificam MOV; o vídeo continua válido,
      // mas as listas usarão o placeholder sem baixar o arquivo.
      poster = null;
    }
  }
  const gifUrl = await uploadArquivoAssinado(file);
  const imagemUrl = poster ? await uploadArquivoAssinado(poster) : gifUrl;
  return { gifUrl, imagemUrl };
}
