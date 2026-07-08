export type MidiaTipo = "image" | "video";

export interface MidiaResolvida {
  tipo: MidiaTipo;
  src: string;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i;
const SUPABASE_VIDEO_PATH =
  /\/storage\/v1\/object\/(?:public|sign)\/exercicios-midia\/.+\.(mp4|webm|mov|m4v|ogg)/i;

/** Converte URL de mídia em tipo reproduzível (Supabase Storage ou imagem). */
export function resolverUrlMidia(url: string | null | undefined): MidiaResolvida | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  if (/drive\.google\.com/i.test(trimmed)) {
    return null;
  }

  if (VIDEO_EXT.test(trimmed) || SUPABASE_VIDEO_PATH.test(trimmed)) {
    return { tipo: "video", src: trimmed };
  }

  return { tipo: "image", src: trimmed };
}
