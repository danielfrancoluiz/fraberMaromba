"use client";

import { Dumbbell } from "lucide-react";
import { TreinoTemplate } from "@/types";

interface TemplateCardProps {
  template: TreinoTemplate;
  onAtribuir: (t: TreinoTemplate) => void;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

function formatarData(dataIso: string): string {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "--/--/----";
  return data.toLocaleDateString("pt-BR");
}

export function TemplateCard({ template, onAtribuir }: TemplateCardProps) {
  return (
    <article
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        fontFamily: "Inter, sans-serif",
        display: "grid",
        gap: "10px",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Dumbbell size={17} color={colors.primary} />
          {template.nome}
        </h3>
        <span style={{ color: colors.textSecondary, fontSize: "0.8rem" }}>
          {formatarData(template.dataCriacao)}
        </span>
      </header>

      {template.descricao ? (
        <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.9rem" }}>
          {template.descricao}
        </p>
      ) : null}

      <p style={{ margin: 0, color: colors.textPrimary, fontSize: "0.9rem" }}>
        {template.exercicios.length} exercício(s)
      </p>

      <ul
        style={{
          margin: 0,
          paddingLeft: "18px",
          color: colors.textSecondary,
          fontSize: "0.88rem",
          display: "grid",
          gap: "4px",
        }}
      >
        {template.exercicios.map((exercicio) => (
          <li key={exercicio.id}>{exercicio.nome}</li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onAtribuir(template)}
        style={{
          marginTop: "4px",
          minHeight: "48px",
          border: "none",
          borderRadius: "10px",
          backgroundColor: colors.primary,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Atribuir a Aluno
      </button>
    </article>
  );
}
