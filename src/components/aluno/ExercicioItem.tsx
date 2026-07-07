"use client";

import { useState } from "react";
import { CheckCircle, Dumbbell, RefreshCw } from "lucide-react";
import { Exercicio } from "@/types";
import { getExercicioImagemUrl, getGrupoMuscularCor } from "@/lib/exercicio-imagem";
import { UnilateralIndicator } from "@/components/exercicio/UnilateralIndicator";

interface ExercicioItemProps {
  exercicio: Exercicio;
  concluido: boolean;
  onMarcar: () => void;
  onDesmarcar: () => void;
  onSubstituir: () => void;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
  concluidoBg: "#0d2b1a",
  concluidoIcon: "#22c55e",
};

function ExercicioThumbnail({ exercicio }: { exercicio: Exercicio }) {
  const [imgErro, setImgErro] = useState(false);
  const url =
    getExercicioImagemUrl(exercicio.nome) ??
    exercicio.imagemUrl ??
    exercicio.gifUrl;
  const cor = getGrupoMuscularCor(exercicio.grupoMuscular);

  if (url && !imgErro) {
    return (
      <img
        src={url}
        alt=""
        width={48}
        height={48}
        onError={() => setImgErro(true)}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "10px",
          objectFit: "cover",
          flexShrink: 0,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "10px",
        background: `${cor}22`,
        border: `1px solid ${cor}66`,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <Dumbbell size={22} color={cor} />
    </div>
  );
}

export function ExercicioItem({
  exercicio,
  concluido,
  onMarcar,
  onDesmarcar,
  onSubstituir,
}: ExercicioItemProps) {
  return (
    <article
      style={{
        backgroundColor: concluido ? colors.concluidoBg : colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "12px 14px",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <ExercicioThumbnail exercicio={exercicio} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: "1rem",
            textDecoration: concluido ? "line-through" : "none",
            opacity: concluido ? 0.85 : 1,
          }}
        >
          {exercicio.nome}
        </h3>

        <div
          style={{
            marginTop: "8px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          <span
            style={{
              backgroundColor: colors.primary,
              color: colors.textPrimary,
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {exercicio.series} x {exercicio.repeticoes}
          </span>
          {exercicio.grupoMuscular ? (
            <span
              style={{
                backgroundColor: colors.border,
                color: colors.textSecondary,
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "0.8rem",
              }}
            >
              {exercicio.grupoMuscular}
            </span>
          ) : null}
          <UnilateralIndicator unilateral={exercicio.unilateral ?? false} />
        </div>

        {exercicio.observacao ? (
          <p style={{ margin: "8px 0 0", color: colors.textSecondary, fontSize: "0.88rem" }}>
            {exercicio.observacao}
          </p>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={concluido ? onDesmarcar : onMarcar}
          aria-label={concluido ? "Desmarcar exercício" : "Marcar exercício como concluído"}
          style={{
            minWidth: "40px",
            minHeight: "40px",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: `2px solid ${concluido ? colors.concluidoIcon : colors.border}`,
            backgroundColor: concluido ? "rgba(34, 197, 94, 0.15)" : "transparent",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {concluido ? <CheckCircle size={20} color={colors.concluidoIcon} /> : null}
        </button>

        <button
          type="button"
          onClick={onSubstituir}
          style={{
            border: "none",
            background: "transparent",
            color: colors.textSecondary,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} />
          Substituir
        </button>
      </div>
    </article>
  );
}
