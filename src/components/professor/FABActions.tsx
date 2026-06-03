"use client";

import { Dumbbell, UserPlus } from "lucide-react";

interface FABActionsProps {
  onCadastrar: () => void;
  onCriarTreino: () => void;
  className?: string;
}

const colors = {
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
};

export function FABActions({ onCadastrar, onCriarTreino, className = "" }: FABActionsProps) {
  const buttonBaseStyle: React.CSSProperties = {
    border: "none",
    borderRadius: "9999px",
    color: colors.textPrimary,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    fontFamily: "Inter, sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.28)",
  };

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 40,
      }}
    >
      <button type="button" onClick={onCadastrar} style={{ ...buttonBaseStyle, backgroundColor: colors.primary }}>
        <UserPlus size={18} />
        + Cadastrar Aluno
      </button>
      <button
        type="button"
        onClick={onCriarTreino}
        style={{ ...buttonBaseStyle, backgroundColor: colors.secondary }}
      >
        <Dumbbell size={18} />
        + Criar Treino
      </button>
    </div>
  );
}
