"use client";

import { Search } from "lucide-react";

interface BuscaAlunosProps {
  valor: string;
  onChange: (v: string) => void;
}

const colors = {
  surface: "#181818",
  textPrimary: "#f0f0f0",
  textSecondary: "#888888",
  border: "#2c2c2c",
};

export function BuscaAlunos({ valor, onChange }: BuscaAlunosProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "12px 14px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Search size={18} color={colors.textSecondary} />
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar aluno pelo nome..."
        style={{
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          color: colors.textPrimary,
          width: "100%",
          fontSize: "0.95rem",
        }}
      />
    </div>
  );
}
