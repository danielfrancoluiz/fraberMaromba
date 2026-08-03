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
  const [poster, setPoster] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "true");
    // Preciso para desenhar no canvas sem taint (Supabase Storage público).
    video.crossOrigin = "anonymous";

    const limpar = () => {
      video.removeAttribute("src");
      video.load();
    };

    const capturarFrame = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return false;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        if (!cancelado) {
          setPoster(dataUrl);
          setLoading(false);
          setFailed(false);
        }
        return true;
      } catch {
        return false;
      }
    };

    const aoDados = () => {
      const tentarSeek = () => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          if (!capturarFrame() && !cancelado) {
            // Fallback: mostra o próprio vídeo posicionado.
            setLoading(false);
          }
        };
        video.addEventListener("seeked", onSeeked);
        try {
          const t =
            Number.isFinite(video.duration) && video.duration > 0
              ? Math.min(0.15, video.duration * 0.02)
              : 0.1;
          if (Math.abs(video.currentTime - t) < 0.01) {
            video.removeEventListener("seeked", onSeeked);
            if (!capturarFrame() && !cancelado) setLoading(false);
          } else {
            video.currentTime = t;
          }
        } catch {
          video.removeEventListener("seeked", onSeeked);
          if (!capturarFrame() && !cancelado) setLoading(false);
        }
      };

      if (video.readyState >= 2) tentarSeek();
    };

    video.addEventListener("loadeddata", aoDados);
    video.addEventListener("error", () => {
      if (!cancelado) {
        setFailed(true);
        setLoading(false);
        onError?.();
      }
    });

    // Fragmento #t= ajuda alguns browsers a abrir num frame inicial.
    const comTempo = src.includes("#") ? src : `${src}#t=0.1`;
    video.src = comTempo;

    return () => {
      cancelado = true;
      video.removeEventListener("loadeddata", aoDados);
      limpar();
    };
  }, [src, onError]);

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
      {poster ? (
        <img
          src={poster}
          alt=""
          className="exercicio-midia--video"
          draggable={false}
        />
      ) : (
        <video
          src={src.includes("#") ? src : `${src}#t=0.1`}
          className="exercicio-midia--video"
          playsInline
          preload="auto"
          muted
          crossOrigin="anonymous"
          aria-hidden
          tabIndex={-1}
          style={{ opacity: loading ? 0.35 : 1 }}
        />
      )}
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
  const [poster, setPoster] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    const capturar = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        if (!cancelado) setPoster(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        /* CORS */
      }
    };

    const onLoaded = () => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        capturar();
      };
      video.addEventListener("seeked", onSeeked);
      try {
        video.currentTime = 0.1;
      } catch {
        video.removeEventListener("seeked", onSeeked);
        capturar();
      }
    };

    video.addEventListener("loadeddata", onLoaded);
    video.src = src.includes("#") ? src : `${src}#t=0.1`;

    return () => {
      cancelado = true;
      video.removeEventListener("loadeddata", onLoaded);
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

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
      {!started && poster ? (
        <img
          src={poster}
          alt=""
          className="exercicio-midia--video"
          aria-hidden
          draggable={false}
        />
      ) : null}
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
        crossOrigin="anonymous"
        onContextMenu={(event) => event.preventDefault()}
        onError={handleVideoError}
        aria-label={alt}
        style={
          !started && poster
            ? { opacity: 0, position: "absolute", inset: 0 }
            : undefined
        }
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
        compact={compact}
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
