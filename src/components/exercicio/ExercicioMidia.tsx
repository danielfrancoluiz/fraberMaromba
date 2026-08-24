"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Play } from "lucide-react";
import {
  resolverUrlMidia,
  type MidiaResolvida,
} from "@/lib/exercicio-media-url";

interface ExercicioMidiaProps {
  /** Vídeo/GIF/imagem original. */
  url?: string | null;
  /** Poster estático do vídeo, usado sem baixar o arquivo original. */
  posterUrl?: string | null;
  alt: string;
  className?: string;
  mediaClassName?: string;
  /** Miniaturas nunca carregam o vídeo. */
  compact?: boolean;
  onError?: () => void;
}

export function resolverMidiaDeUrl(url?: string | null): MidiaResolvida | null {
  return resolverUrlMidia(url);
}

function classes(mediaClassName: string, className?: string): string {
  return `${mediaClassName}${className ? ` ${className}` : ""}`;
}

function VideoPlaceholder({
  mediaClassName,
  className,
  compact,
}: {
  mediaClassName: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`exercicio-midia-video-wrap${compact ? " exercicio-midia-video-wrap--compact" : ""} ${classes(mediaClassName, className)}`}
    >
      <div className="exercicio-midia--video exercicio-midia--empty" />
      <div className="exercicio-midia-poster-play-icon" aria-hidden>
        <Play size={compact ? 16 : 28} />
      </div>
    </div>
  );
}

function VideoThumb({
  posterUrl,
  alt,
  mediaClassName,
  className,
  onError,
}: {
  posterUrl?: string | null;
  alt: string;
  mediaClassName: string;
  className?: string;
  onError?: () => void;
}) {
  const poster = resolverUrlMidia(posterUrl);
  if (!poster || poster.tipo !== "image") {
    return (
      <VideoPlaceholder
        mediaClassName={mediaClassName}
        className={className}
        compact
      />
    );
  }

  return (
    <div
      className={`exercicio-midia-video-wrap exercicio-midia-video-wrap--compact ${classes(mediaClassName, className)}`}
    >
      <img
        src={poster.src}
        alt={alt}
        className="exercicio-midia--video"
        draggable={false}
        loading="lazy"
        onError={onError}
      />
      <div className="exercicio-midia-poster-play-icon" aria-hidden>
        <Play size={16} />
      </div>
    </div>
  );
}

function ProtectedVideo({
  src,
  posterUrl,
  alt,
  mediaClassName,
  className,
  onError,
}: {
  src: string;
  posterUrl?: string | null;
  alt: string;
  mediaClassName: string;
  className?: string;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const poster = resolverUrlMidia(posterUrl);
  const posterImagem = poster?.tipo === "image" ? poster.src : null;

  useEffect(() => {
    if (!started) return;
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => setLoadError(true));
    });
  }, [started]);

  const handleVideoError = () => {
    setLoadError(true);
    onError?.();
  };

  return (
    <div
      className={`exercicio-midia-video-wrap ${classes(mediaClassName, className)}`}
    >
      {!started && posterImagem ? (
        <img
          src={posterImagem}
          alt=""
          className="exercicio-midia--video"
          aria-hidden
          draggable={false}
          loading="lazy"
          onError={onError}
        />
      ) : null}

      {started ? (
        <video
          ref={videoRef}
          src={src}
          className="exercicio-midia--video"
          playsInline
          preload="none"
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={(event) => event.preventDefault()}
          onError={handleVideoError}
          aria-label={alt}
        />
      ) : !posterImagem ? (
        <div className="exercicio-midia--video exercicio-midia--empty" />
      ) : null}

      {!started && !loadError ? (
        <button
          type="button"
          className="exercicio-midia-play-overlay"
          onClick={() => setStarted(true)}
          aria-label={`Reproduzir ${alt}`}
        >
          <Play size={40} />
          <span>Assistir vídeo</span>
        </button>
      ) : null}

      {loadError ? (
        <div className="exercicio-midia-video-error">
          <p>Não foi possível carregar o vídeo.</p>
        </div>
      ) : null}
    </div>
  );
}

export function ExercicioMidia({
  url,
  posterUrl,
  alt,
  className,
  mediaClassName = "exercicio-midia",
  compact = false,
  onError,
}: ExercicioMidiaProps) {
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

  if (midia.tipo === "video" && compact) {
    return (
      <VideoThumb
        posterUrl={posterUrl}
        alt={alt}
        mediaClassName={mediaClassName}
        className={className}
        onError={onError}
      />
    );
  }

  if (midia.tipo === "video") {
    return (
      <ProtectedVideo
        src={midia.src}
        posterUrl={posterUrl}
        alt={alt}
        mediaClassName={mediaClassName}
        className={className}
        onError={onError}
      />
    );
  }

  return (
    <img
      src={midia.src}
      alt={alt}
      className={classes(mediaClassName, className)}
      loading={compact ? "lazy" : undefined}
      onError={onError}
    />
  );
}
