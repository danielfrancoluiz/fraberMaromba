"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Aluno } from "@/types";
import { ListCard } from "@/components/ui/ListCard";
import { Badge } from "@/components/ui/Badge";

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
    <ListCard
      title={aluno.nomeCompleto}
      icon={User}
      onClick={() => router.push(`/professor/alunos/${aluno.id}`)}
      badge={<Badge variant="muted">{nomePlano}</Badge>}
      meta={
        <>
          <span>Cadastro {formatarData(aluno.dataCadastro)}</span>
        </>
      }
    />
  );
}
