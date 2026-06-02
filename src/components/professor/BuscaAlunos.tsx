"use client";

import { Search } from "lucide-react";

interface BuscaAlunosProps {
  valor: string;
  onChange: (v: string) => void;
}

const colors = {
  surface: "#132035",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
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
