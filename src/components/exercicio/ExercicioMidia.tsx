"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Em miniaturas: mostra o frame do vídeo com ícone de play (sem reproduzir). */
  compact?: boolean;
  onError?: () => void;
}

export function resolverMidiaDeUrl(url?: string | null): MidiaResolvida | null {
  return resolverUrlMidia(url);
}

function MidiaPlayOverlay({
  alt,
  compact,
  onClick,
}: {
  alt: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="exercicio-midia-play-overlay"
      onClick={onClick}
      aria-label={`Reproduzir ${alt}`}
    >
      <Play size={compact ? 22 : 40} />
      {!compact ? <span>Assistir vídeo</span> : null}
    </button>
  );
}

function VideoPosterThumb({
  src,
  mediaClassName,
  className,
  onError,
}: {
  src: string;
  mediaClassName: string;
  className?: string;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const captureFrame = () => {
      if (video.paused && video.currentTime < 0.01) {
        video.currentTime = 0.01;
      }
    };

    video.addEventListener("loadeddata", captureFrame);
    return () => video.removeEventListener("loadeddata", captureFrame);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`${mediaClassName} exercicio-midia--empty${className ? ` ${className}` : ""}`}
      >
        <Play size={18} />
      </div>
    );
  }

  return (
    <div
      className={`exercicio-midia-video-wrap exercicio-midia-video-wrap--compact ${mediaClassName}${className ? ` ${className}` : ""}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="exercicio-midia--video"
        playsInline
        preload="metadata"
        muted
        aria-hidden
        tabIndex={-1}
        onError={() => {
          setFailed(true);
          onError?.();
        }}
      />
      <div className="exercicio-midia-poster-play-icon" aria-hidden>
        <Play size={16} />
      </div>
    </div>
  );
}

function ProtectedVideo({
  src,
  alt,
  mediaClassName,
  className,
  compact,
  onError,
}: {
  src: string;
  alt: string;
  mediaClassName: string;
  className?: string;
  compact?: boolean;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const captureFrame = () => {
      if (!started && video.paused && video.currentTime < 0.01) {
        video.currentTime = 0.01;
      }
    };

    video.addEventListener("loadeddata", captureFrame);
    return () => video.removeEventListener("loadeddata", captureFrame);
  }, [src, started]);

  const handleStart = async () => {
    const video = videoRef.current;
    if (!video || loadError) return;

    setStarted(true);
    video.muted = false;

    try {
      await video.play();
    } catch {
      video.muted = true;
      try {
        await video.play();
      } catch {
        setLoadError(true);
      }
    }
  };

  const handleVideoError = () => {
    setLoadError(true);
    onError?.();
  };

  return (
    <div
      className={`exercicio-midia-video-wrap ${mediaClassName}${className ? ` ${className}` : ""}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="exercicio-midia--video"
        playsInline
        preload="auto"
        muted={!started}
        controls={started}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(event) => event.preventDefault()}
        onError={handleVideoError}
        aria-label={alt}
      />

      {!started && !loadError ? (
        <MidiaPlayOverlay
          alt={alt}
          compact={compact}
          onClick={() => void handleStart()}
        />
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
      <VideoPosterThumb
        src={midia.src}
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
      className={`${mediaClassName}${className ? ` ${className}` : ""}`}
      onError={onError}
    />
  );
}
