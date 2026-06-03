"use client";

import { useState } from "react";
import { Treino } from "@/types";

interface TreinoResumoCardProps {
  treino: Treino;
  /** Séries concluídas na sessão em andamento (se houver). */
  seriesConcluidas: number;
  onClick: () => void;
}

const colors = {
  surface: "#132035",
  hover: "#1E3050",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

const DIA_LABELS: Record<Treino["diaSemana"], string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function TreinoResumoCard({
  treino,
  seriesConcluidas,
  onClick,
}: TreinoResumoCardProps) {
  const [hovered, setHovered] = useState(false);
  const totalSeries = treino.exercicios.reduce((acc, ex) => acc + ex.series, 0);
  const progresso =
    totalSeries > 0 ? Math.min(100, (seriesConcluidas / totalSeries) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        backgroundColor: hovered ? colors.hover : colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: "1rem" }}>
          {treino.nome}
        </h3>
        <span
          style={{
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            borderRadius: "999px",
            padding: "4px 10px",
            fontSize: "0.8rem",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {DIA_LABELS[treino.diaSemana]}
        </span>
      </div>

      <div
        style={{
          height: "8px",
          borderRadius: "999px",
          backgroundColor: colors.border,
          overflow: "hidden",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            backgroundColor: colors.primary,
          }}
        />
      </div>

      <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.88rem" }}>
        {seriesConcluidas} de {totalSeries} séries
        {seriesConcluidas > 0 && seriesConcluidas < totalSeries ? " (em andamento)" : ""}
      </p>
    </button>
  );
}
