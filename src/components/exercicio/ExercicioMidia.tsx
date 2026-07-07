"use client";

import { ImageIcon, Play } from "lucide-react";
import { resolverUrlMidia, type MidiaResolvida } from "@/lib/exercicio-media-url";

interface ExercicioMidiaProps {
  url?: string | null;
  alt: string;
  className?: string;
  mediaClassName?: string;
  /** Em miniaturas: não embute iframe do Drive (mostra ícone). */
  compact?: boolean;
  onError?: () => void;
}

export function resolverMidiaDeUrl(url?: string | null): MidiaResolvida | null {
  return resolverUrlMidia(url);
}

export function ExercicioMidia({
  url,
  alt,
  className,
  mediaClassName = "exercicio-midia",
  compact = false,
  onError,
}: ExercicioMidiaProps) {
  const midia = resolverUrlMidia(url);

  if (!midia) {
    return (
      <div className={`${mediaClassName} exercicio-midia--empty${className ? ` ${className}` : ""}`}>
        <ImageIcon size={compact ? 20 : 48} />
      </div>
    );
  }

  if (midia.tipo === "embed" && compact) {
    return (
      <div className={`${mediaClassName} exercicio-midia--drive${className ? ` ${className}` : ""}`}>
        <Play size={compact ? 18 : 32} />
      </div>
    );
  }

  if (midia.tipo === "embed") {
    return (
      <iframe
        src={midia.src}
        title={alt}
        className={`${mediaClassName} exercicio-midia--embed${className ? ` ${className}` : ""}`}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }

  if (midia.tipo === "video") {
    return (
      <video
        src={midia.src}
        className={`${mediaClassName} exercicio-midia--video${className ? ` ${className}` : ""}`}
        autoPlay
        loop
        muted
        playsInline
        controls
        onError={onError}
      />
    );
  }

  return (
    <img
      src={midia.src}
      alt={alt}
      className={`${mediaClassName}${className ? ` ${className}` : ""}`}
      onError={onError}
    />
  );
}
