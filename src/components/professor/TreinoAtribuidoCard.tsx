"use client";

import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import { TreinoComAluno } from "@/types";
import { labelObjetivoTreino } from "@/lib/treino-objetivos";
import { Badge } from "@/components/ui/Badge";

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
    <article className="list-card list-card--static list-card--stacked">
      <div className="list-card-accent list-card-accent--accent" aria-hidden />
      <div className="list-card-stacked-inner">
        <div className="list-card-body list-card-body--stacked">
          <div className="list-card-icon-wrap">
            <Dumbbell size={18} className="list-card-icon" />
          </div>
          <div className="list-card-content">
            <div className="list-card-top">
              <h3 className="list-card-title">{treino.nome}</h3>
              <div className="list-card-badge">
                <Badge variant="primary">{diaLabel[treino.diaSemana]}</Badge>
              </div>
            </div>
            <div className="list-card-meta">
              {treino.alunoNome ? <span>{treino.alunoNome}</span> : null}
              {treino.alunoNome ? <span>·</span> : null}
              <span>
                {treino.exercicios.length} exercício
                {treino.exercicios.length !== 1 ? "s" : ""}
              </span>
              {objetivoLabel ? (
                <>
                  <span>·</span>
                  <span>{objetivoLabel}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="card-actions-bar">
          <button
            type="button"
            className="btn-secondary btn-compact card-actions-bar-btn"
            onClick={() => onEditar(treino)}
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            type="button"
            className="chip chip--danger btn-compact card-actions-bar-btn"
            onClick={() => onExcluir(treino)}
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}
