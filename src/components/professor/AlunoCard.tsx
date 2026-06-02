"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aluno } from "@/types";

interface AlunoCardProps {
  aluno: Aluno;
  nomePlano: string;
}

const colors = {
  surface: "#132035",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

function formatarData(dataIso: string): string {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "--/--/----";
  return data.toLocaleDateString("pt-BR");
}

export function AlunoCard({ aluno, nomePlano }: AlunoCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onClick={() => router.push(`/professor/alunos/${aluno.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "#1E3050" : colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
    >
      <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: "1rem" }}>{aluno.nomeCompleto}</h3>
      <p style={{ margin: "8px 0 0", color: colors.textSecondary, fontSize: "0.9rem" }}>
        Plano: {nomePlano}
      </p>
      <p style={{ margin: "4px 0 0", color: colors.textSecondary, fontSize: "0.85rem" }}>
        Cadastro: {formatarData(aluno.dataCadastro)}
      </p>
    </article>
  );
}
