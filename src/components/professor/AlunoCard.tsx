"use client";

import { useRouter } from "next/navigation";
import { Aluno } from "@/types";

interface AlunoCardProps {
  aluno: Aluno;
  nomePlano: string;
}

function formatarData(dataIso: string): string {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "--/--/----";
  return data.toLocaleDateString("pt-BR");
}

export function AlunoCard({ aluno, nomePlano }: AlunoCardProps) {
  const router = useRouter();

  return (
    <article
      className="card card-hover"
      onClick={() => router.push(`/professor/alunos/${aluno.id}`)}
      style={{ cursor: "pointer", transition: "all 0.15s ease" }}
    >
      <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{aluno.nomeCompleto}</h3>
      <p className="text-muted" style={{ margin: "8px 0 0", fontSize: "0.9rem" }}>
        Plano: {nomePlano}
      </p>
      <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
        Cadastro: {formatarData(aluno.dataCadastro)}
      </p>
    </article>
  );
}
