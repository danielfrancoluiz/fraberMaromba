"use client";

import { Dumbbell, Pencil, Trash2, User } from "lucide-react";
import { TreinoComAluno } from "@/types";
import { labelObjetivoTreino } from "@/lib/treino-objetivos";

interface TreinoAtribuidoCardProps {
  treino: TreinoComAluno;
  onEditar: (treino: TreinoComAluno) => void;
  onExcluir: (treino: TreinoComAluno) => void;
}

const diaLabel: Record<TreinoComAluno["diaSemana"], string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function TreinoAtribuidoCard({
  treino,
  onEditar,
  onExcluir,
}: TreinoAtribuidoCardProps) {
  const objetivoLabel = labelObjetivoTreino(treino.objetivo);

  return (
    <article className="card treino-atribuido-card">
      <header className="treino-atribuido-header">
        <div className="treino-atribuido-title-row">
          <Dumbbell size={18} className="text-accent" />
          <h3 className="treino-atribuido-nome">{treino.nome}</h3>
        </div>
        <span className="treino-atribuido-dia">{diaLabel[treino.diaSemana]}</span>
      </header>

      {treino.alunoNome ? (
        <p className="treino-atribuido-aluno">
          <User size={14} />
          {treino.alunoNome}
        </p>
      ) : null}

      {objetivoLabel ? (
        <p className="text-muted treino-atribuido-meta">Meta: {objetivoLabel}</p>
      ) : null}

      {treino.descricao ? (
        <p className="text-muted treino-atribuido-desc">{treino.descricao}</p>
      ) : null}

      <p className="text-muted" style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
        {treino.exercicios.length} exercício
        {treino.exercicios.length !== 1 ? "s" : ""}
      </p>

      <div className="treino-atribuido-acoes">
        <button
          type="button"
          className="chip chip--icon"
          onClick={() => onEditar(treino)}
          aria-label="Editar treino"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="chip chip--danger chip--icon"
          onClick={() => onExcluir(treino)}
          aria-label="Excluir treino"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
