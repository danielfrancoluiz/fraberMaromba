"use client";

import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import { Treino } from "@/types";
import { labelObjetivoTreino } from "@/lib/treino-objetivos";
import { Badge } from "@/components/ui/Badge";

interface TreinoCardProps {
  treino: Treino;
  onEditar?: (treino: Treino) => void;
  onExcluir?: (treino: Treino) => void;
}

const diaLabel: Record<Treino["diaSemana"], string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function TreinoCard({ treino, onEditar, onExcluir }: TreinoCardProps) {
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
              {objetivoLabel ? <span>Meta: {objetivoLabel}</span> : null}
              {treino.descricao ? (
                <>
                  {objetivoLabel ? <span>·</span> : null}
                  <span>{treino.descricao}</span>
                </>
              ) : null}
              <span>·</span>
              <span>
                {treino.exercicios.length} exercício
                {treino.exercicios.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ul className="treino-exercises">
              {treino.exercicios.map((exercicio) => (
                <li key={exercicio.id}>
                  <strong className="treino-exercise-name">{exercicio.nome}</strong>
                  <span className="treino-exercise-meta">
                    {exercicio.series} x {exercicio.repeticoes}
                  </span>
                  {exercicio.observacao ? (
                    <p className="treino-exercise-note">{exercicio.observacao}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {(onEditar || onExcluir) && (
          <div className="card-actions-bar">
            {onEditar ? (
              <button
                type="button"
                className="btn-secondary btn-compact card-actions-bar-btn"
                onClick={() => onEditar(treino)}
              >
                <Pencil size={16} />
                Editar
              </button>
            ) : (
              <span />
            )}
            {onExcluir ? (
              <button
                type="button"
                className="chip chip--danger btn-compact card-actions-bar-btn"
                onClick={() => onExcluir(treino)}
              >
                <Trash2 size={16} />
                Excluir
              </button>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
