"use client";

import { CheckCircle2, ChevronRight, Dumbbell } from "lucide-react";
import type { Exercicio, Treino } from "@/types";
import { ExercicioMidia } from "@/components/exercicio/ExercicioMidia";
import { UnilateralIndicator } from "@/components/exercicio/UnilateralIndicator";
import {
  exercicioConcluido,
  seriesConcluidasExercicio,
  totalSeriesConcluidas,
  todosExerciciosConcluidos,
} from "@/lib/treino-progresso";
import { finalizarSessao } from "@/services/sessaoService";

interface TreinoExerciciosListaProps {
  treino: Treino;
  completedSets: Record<string, boolean[]>;
  sessaoId: string | null;
  loading?: boolean;
  onSelecionarExercicio: (indice: number) => void;
  onVoltar: () => void;
  onTreinoFinalizado?: () => void;
}

export function TreinoExerciciosLista({
  treino,
  completedSets,
  sessaoId,
  loading = false,
  onSelecionarExercicio,
  onVoltar,
  onTreinoFinalizado,
}: TreinoExerciciosListaProps) {
  const totalSeries = treino.exercicios.reduce((acc, ex) => acc + ex.series, 0);
  const seriesFeitas = totalSeriesConcluidas(completedSets);
  const progressoPct =
    totalSeries > 0 ? Math.round((seriesFeitas / totalSeries) * 100) : 0;
  const treinoCompleto = todosExerciciosConcluidos(treino.exercicios, completedSets);

  async function handleFinalizarTreino() {
    if (!sessaoId) return;
    try {
      await finalizarSessao(sessaoId, 0);
      onTreinoFinalizado?.();
    } catch {
      onTreinoFinalizado?.();
    }
  }

  return (
    <main className="page-main student-page-main treino-lista-page">
      <div className="page-container page-stack">
        <header className="treino-lista-header">
          <button type="button" className="treino-lista-voltar" onClick={onVoltar}>
            ← Voltar
          </button>
          <div>
            <h1 className="treino-lista-titulo">{treino.nome}</h1>
            <p className="text-muted treino-lista-subtitulo">
              {treino.exercicios.length} exercícios · escolha qual fazer
            </p>
          </div>
        </header>

        <div className="treino-lista-progresso card">
          <div className="treino-lista-progresso-top">
            <span className="text-muted">Progresso do dia</span>
            <strong>
              {seriesFeitas}/{totalSeries} séries
            </strong>
          </div>
          <div
            className="treino-lista-progresso-bar"
            role="progressbar"
            aria-valuenow={progressoPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="treino-lista-progresso-fill"
              style={{ width: `${progressoPct}%` }}
            />
          </div>
        </div>

        {loading ? (
          <p className="loading-center text-muted">Carregando exercícios...</p>
        ) : (
          <div className="treino-lista-exercicios page-stack">
            {treino.exercicios.map((exercicio, indice) => (
              <TreinoExercicioCard
                key={exercicio.id}
                exercicio={exercicio}
                indice={indice}
                concluido={exercicioConcluido(completedSets, exercicio)}
                seriesFeitas={seriesConcluidasExercicio(completedSets, exercicio)}
                onClick={() => onSelecionarExercicio(indice)}
              />
            ))}
          </div>
        )}

        {treinoCompleto ? (
          <button
            type="button"
            className="btn-primary treino-lista-finalizar"
            onClick={() => void handleFinalizarTreino()}
          >
            <CheckCircle2 size={18} />
            Finalizar treino do dia
          </button>
        ) : null}
      </div>
    </main>
  );
}

function TreinoExercicioCard({
  exercicio,
  indice,
  concluido,
  seriesFeitas,
  onClick,
}: {
  exercicio: Exercicio;
  indice: number;
  concluido: boolean;
  seriesFeitas: number;
  onClick: () => void;
}) {
  const midiaUrl = exercicio.gifUrl ?? exercicio.imagemUrl ?? null;

  return (
    <button
      type="button"
      className={`treino-exercicio-card card${concluido ? " treino-exercicio-card--done" : ""}`}
      onClick={onClick}
    >
      <div className="treino-exercicio-card-thumb">
        {midiaUrl ? (
          <ExercicioMidia
            url={midiaUrl}
            alt={exercicio.nome}
            compact
            mediaClassName="treino-exercicio-card-media"
          />
        ) : (
          <div className="treino-exercicio-card-media treino-exercicio-card-media--empty">
            <Dumbbell size={20} />
          </div>
        )}
      </div>

      <div className="treino-exercicio-card-body">
        <div className="treino-exercicio-card-top">
          <span className="treino-exercicio-card-num">#{indice + 1}</span>
          {concluido ? (
            <span className="treino-exercicio-card-badge">Concluído</span>
          ) : seriesFeitas > 0 ? (
            <span className="treino-exercicio-card-badge treino-exercicio-card-badge--progress">
              Em andamento
            </span>
          ) : null}
        </div>
        <h2 className="treino-exercicio-card-nome">{exercicio.nome}</h2>
        <div className="treino-exercicio-card-meta">
          <span>
            {seriesFeitas}/{exercicio.series} séries · {exercicio.repeticoes} reps
          </span>
          {exercicio.grupoMuscular ? <span>{exercicio.grupoMuscular}</span> : null}
          <UnilateralIndicator unilateral={exercicio.unilateral ?? false} />
        </div>
      </div>

      <div className="treino-exercicio-card-action" aria-hidden>
        {concluido ? <CheckCircle2 size={22} /> : <ChevronRight size={22} />}
      </div>
    </button>
  );
}
