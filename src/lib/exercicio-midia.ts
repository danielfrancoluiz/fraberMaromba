export const BUCKET_EXERCICIOS_MIDIA = "exercicios-midia";

export const MAX_MIDIA_BYTES = 50 * 1024 * 1024;

const EXT_POR_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const MIME_POR_EXT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/mp4",
  gif: "image/gif",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export function mimesMidiaPermitidos(): string[] {
  return Object.keys(EXT_POR_MIME);
}

export function extensaoMidiaPermitida(mime: string): string | null {
  return EXT_POR_MIME[mime.toLowerCase()] ?? null;
}

/** No mobile, `file.type` às vezes vem vazio — inferimos pela extensão. */
export function resolverMimeMidia(file: Pick<File, "type" | "name">): string {
  const direto = file.type?.trim().toLowerCase();
  if (direto && EXT_POR_MIME[direto]) return direto;

  const ext = file.name.split(".").pop()?.trim().toLowerCase();
  if (ext && MIME_POR_EXT[ext]) return MIME_POR_EXT[ext];

  return direto ?? "";
}

export function validarArquivoMidia(
  file: Pick<File, "type" | "name" | "size">
): string | null {
  if (file.size <= 0) return "Arquivo vazio";
  if (file.size > MAX_MIDIA_BYTES) {
    return "Arquivo muito grande (máximo 50 MB)";
  }

  const mime = resolverMimeMidia(file);
  if (!extensaoMidiaPermitida(mime)) {
    return "Formato não suportado. Use MP4, WebM, MOV, GIF, WebP, JPG ou PNG";
  }

  return null;
}
