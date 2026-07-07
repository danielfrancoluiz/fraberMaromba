export type MidiaTipo = "image" | "video" | "embed";

export interface MidiaResolvida {
  tipo: MidiaTipo;
  src: string;
  driveVideoSrc?: string;
  driveViewUrl?: string;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i;

export function extrairGoogleDriveFileId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes("drive.google.com")) return null;

    const pathMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (pathMatch) return pathMatch[1];

    const idParam = parsed.searchParams.get("id");
    if (idParam) return idParam;

    return null;
  } catch {
    return null;
  }
}

export function urlPreviewGoogleDrive(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function urlDownloadGoogleDrive(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function urlViewGoogleDrive(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/** Converte links de compartilhamento (view, drive_link) em URL reproduzível. */
export function resolverUrlMidia(url: string | null | undefined): MidiaResolvida | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const driveId = extrairGoogleDriveFileId(trimmed);
  if (driveId) {
    return {
      tipo: "embed",
      src: urlPreviewGoogleDrive(driveId),
      driveVideoSrc: urlDownloadGoogleDrive(driveId),
      driveViewUrl: urlViewGoogleDrive(driveId),
    };
  }

  if (VIDEO_EXT.test(trimmed)) {
    return { tipo: "video", src: trimmed };
  }

  return { tipo: "image", src: trimmed };
}
