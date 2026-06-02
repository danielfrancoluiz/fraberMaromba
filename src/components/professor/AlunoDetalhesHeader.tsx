"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { Aluno } from "@/types";

interface AlunoDetalhesHeaderProps {
  aluno: Aluno;
  onVoltar: () => void;
  onEditar: () => void;
}

const colors = {
  background: "#0D1B2E",
  surface: "#132035",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  border: "#1E3050",
};

export function AlunoDetalhesHeader({
  aluno,
  onVoltar,
  onEditar,
}: AlunoDetalhesHeaderProps) {
  return (
    <header
      style={{
        backgroundColor: colors.background,
        fontFamily: "Inter, sans-serif",
        display: "grid",
        gridTemplateColumns: "40px 1fr 40px",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <button
        type="button"
        onClick={onVoltar}
        style={{
          minHeight: "40px",
          minWidth: "40px",
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={18} />
      </button>

      <h1
        style={{
          margin: 0,
          textAlign: "center",
          color: colors.textPrimary,
          fontSize: "1.25rem",
          fontWeight: 700,
        }}
      >
        {aluno.nomeCompleto}
      </h1>

      <button
        type="button"
        onClick={onEditar}
        style={{
          minHeight: "40px",
          minWidth: "40px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: colors.primary,
          color: colors.textPrimary,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
        }}
      >
        <Pencil size={18} />
      </button>
    </header>
  );
}
