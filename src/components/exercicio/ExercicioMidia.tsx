"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Play } from "lucide-react";
import {
  resolverUrlMidia,
  type MidiaResolvida,
} from "@/lib/exercicio-media-url";

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

function usePreferDriveVideo(): boolean {
  const [prefer, setPrefer] = useState(false);

  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    setPrefer(mobile || touch || narrow);
  }, []);

  return prefer;
}

function DriveFallbackLink({
  viewUrl,
  mediaClassName,
  className,
}: {
  viewUrl: string;
  mediaClassName: string;
  className?: string;
}) {
  return (
    <a
      href={viewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${mediaClassName} exercicio-midia-drive-fallback${className ? ` ${className}` : ""}`}
    >
      <Play size={32} />
      <span>Toque para assistir o vídeo</span>
    </a>
  );
}

function DriveVideoPlayer({
  videoSrc,
  viewUrl,
  alt,
  mediaClassName,
  className,
  onError,
}: {
  videoSrc: string;
  viewUrl: string;
  alt: string;
  mediaClassName: string;
  className?: string;
  onError?: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <DriveFallbackLink
        viewUrl={viewUrl}
        mediaClassName={mediaClassName}
        className={className}
      />
    );
  }

  return (
    <video
      src={videoSrc}
      className={`${mediaClassName} exercicio-midia--video${className ? ` ${className}` : ""}`}
      autoPlay
      loop
      muted
      playsInline
      controls
      preload="metadata"
      onError={() => {
        setFailed(true);
        onError?.();
      }}
      aria-label={alt}
    />
  );
}

export function ExercicioMidia({
  url,
  alt,
  className,
  mediaClassName = "exercicio-midia",
  compact = false,
  onError,
}: ExercicioMidiaProps) {
  const preferDriveVideo = usePreferDriveVideo();
  const midia = resolverUrlMidia(url);

  if (!midia) {
    return (
      <div
        className={`${mediaClassName} exercicio-midia--empty${className ? ` ${className}` : ""}`}
      >
        <ImageIcon size={compact ? 20 : 48} />
      </div>
    );
  }

  if (midia.tipo === "embed" && compact) {
    return (
      <div
        className={`${mediaClassName} exercicio-midia--drive${className ? ` ${className}` : ""}`}
      >
        <Play size={compact ? 18 : 32} />
      </div>
    );
  }

  if (midia.tipo === "embed") {
    const videoSrc = midia.driveVideoSrc ?? midia.src;
    const viewUrl = midia.driveViewUrl ?? midia.src;

    if (preferDriveVideo) {
      return (
        <DriveVideoPlayer
          videoSrc={videoSrc}
          viewUrl={viewUrl}
          alt={alt}
          mediaClassName={mediaClassName}
          className={className}
          onError={onError}
        />
      );
    }

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
        preload="metadata"
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
