"use client";

import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronRight,
  ImageIcon,
  SkipForward,
  X,
  Zap,
} from "lucide-react";
import { Treino } from "@/types";
import { useWorkoutExecution } from "@/hooks/useWorkoutExecution";
import { formatTime } from "@/hooks/useTimer";
import { urlMidiaExercicio } from "@/lib/exercicio-media";
import { labelDificuldade } from "@/lib/dificuldade-label";
import { WorkoutSubstituteModal } from "@/components/aluno/WorkoutSubstituteModal";
import { WorkoutDoneModal } from "@/components/aluno/WorkoutDoneModal";

interface WorkoutExecutionProps {
  treino: Treino;
  alunoId: string;
  onSair: () => void;
  onFinalizar: () => void;
}

export function WorkoutExecution({
  treino,
  alunoId,
  onSair,
  onFinalizar,
}: WorkoutExecutionProps) {
  const {
    exercicios,
    exercicioAtual,
    proximoExercicio,
    exIdx,
    setIdx,
    phase,
    completedSets,
    progressoPct,
    seriesConcluidas,
    totalSeries,
    sessionSeconds,
    restSeconds,
    marcarSerieConcluida,
    pularDescanso,
    showSubModal,
    setShowSubModal,
    showDoneModal,
    fecharTreinoConcluido,
    substitutos,
    loadingSubstitutos,
    substituirExercicio,
    sessaoLoading,
    sessaoErro,
  } = useWorkoutExecution(treino, alunoId, onFinalizar);

  if (sessaoLoading) {
    return (
      <div className="workout-exec" style={{ justifyContent: "center", alignItems: "center" }}>
        <p className="text-muted">Preparando sessão...</p>
      </div>
    );
  }

  if (sessaoErro) {
    return (
      <div
        className="workout-exec"
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          gap: "1rem",
        }}
      >
        <p className="text-accent" style={{ textAlign: "center", margin: 0 }}>
          {sessaoErro}
        </p>
        <button type="button" className="btn-primary" onClick={onSair}>
          Voltar
        </button>
      </div>
    );
  }

  if (!exercicioAtual || exercicios.length === 0) {
    return (
      <div className="workout-exec">
        <p className="text-muted" style={{ textAlign: "center", padding: "2rem" }}>
          Este treino não possui exercícios.
        </p>
        <button type="button" className="btn-primary" onClick={onSair}>
          Voltar
        </button>
      </div>
    );
  }

  const midiaUrl = urlMidiaExercicio(exercicioAtual);
  const proximaMidia = proximoExercicio ? urlMidiaExercicio(proximoExercicio) : null;
  const setsDone = completedSets[exercicioAtual.id] ?? [];
  const descansoPadrao = exercicioAtual.restSeconds ?? 60;

  return (
    <div className="workout-exec">
      <div
        className="workout-exec-progress"
        role="progressbar"
        aria-valuenow={progressoPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="workout-exec-progress-fill" style={{ width: `${progressoPct}%` }} />
      </div>

      <header className="workout-exec-top">
        <button type="button" className="workout-exec-icon-btn" onClick={onSair} aria-label="Sair">
          <X size={18} />
        </button>
        <div className="workout-exec-top-center">
          <p className="workout-exec-counter">
            Exercício {exIdx + 1} / {exercicios.length}
          </p>
          <p className="workout-exec-treino-nome">{treino.nome}</p>
        </div>
        <div className="workout-exec-timer" aria-live="polite">
          <span className="workout-exec-timer-dot" />
          {formatTime(sessionSeconds)}
        </div>
      </header>

      <div className="workout-exec-body">
        <div className="workout-exec-media">
          {midiaUrl ? (
            <img src={midiaUrl} alt={exercicioAtual.nome} className="workout-exec-media-img" />
          ) : (
            <div className="workout-exec-media-empty">
              <ImageIcon size={48} />
            </div>
          )}
          <div className="workout-exec-media-gradient" />

          {phase === "rest" && (
            <div className="workout-exec-rest-overlay">
              <p className="workout-exec-rest-label">Descansando...</p>
              <span className="workout-exec-rest-time">{restSeconds}</span>
              <p className="workout-exec-rest-unit">segundos</p>
              <button
                type="button"
                className="workout-exec-skip-rest"
                onClick={pularDescanso}
                aria-label="Pular descanso"
              >
                <SkipForward size={14} />
                Pular descanso
              </button>
            </div>
          )}

          <div className="workout-exec-media-footer">
            <div>
              <h1 className="workout-exec-ex-nome">{exercicioAtual.nome}</h1>
              <p className="workout-exec-ex-grupo">{exercicioAtual.grupoMuscular ?? ""}</p>
            </div>
            <button
              type="button"
              className="workout-exec-trocar"
              onClick={() => setShowSubModal(true)}
              aria-label="Trocar exercício"
            >
              <ArrowLeftRight size={12} />
              Trocar
            </button>
          </div>
        </div>

        <section className="workout-exec-sets card">
          <div className="workout-exec-sets-row">
            <div>
              <p className="workout-exec-stat-label">Série</p>
              <p className="workout-exec-stat-value">
                {setIdx + 1}
                <span>/{exercicioAtual.series}</span>
              </p>
            </div>
            <div>
              <p className="workout-exec-stat-label">Repetições</p>
              <p className="workout-exec-stat-value">{exercicioAtual.repeticoes}</p>
            </div>
            <div>
              <p className="workout-exec-stat-label">Descanso</p>
              <p className="workout-exec-stat-value">
                {descansoPadrao}
                <span>s</span>
              </p>
            </div>
          </div>

          <div className="workout-exec-circles">
            {Array.from({ length: exercicioAtual.series }).map((_, i) => {
              const done = setsDone[i];
              const isCurrent = i === setIdx && phase === "exercise";
              return (
                <div
                  key={i}
                  className={`workout-exec-circle${done ? " workout-exec-circle--done" : ""}${isCurrent ? " workout-exec-circle--current" : ""}`}
                  aria-label={`Série ${i + 1}${done ? " concluída" : isCurrent ? " atual" : ""}`}
                >
                  {done ? <CheckCircle2 size={16} /> : i + 1}
                </div>
              );
            })}
          </div>

          {exercicioAtual.observacao ? (
            <div className="workout-exec-notes">
              <Zap size={14} />
              <p>{exercicioAtual.observacao}</p>
            </div>
          ) : null}
        </section>

        {(exercicioAtual.descricao || exercicioAtual.equipamento || exercicioAtual.dificuldade) && (
          <section className="workout-exec-how card">
            <p className="workout-exec-how-title">Como executar</p>
            {exercicioAtual.descricao ? (
              <p className="workout-exec-how-text">{exercicioAtual.descricao}</p>
            ) : (
              <p className="workout-exec-how-text text-muted">
                Execute o movimento com controle e amplitude completa.
              </p>
            )}
            <div className="workout-exec-tags">
              {exercicioAtual.equipamento ? (
                <span className="workout-exec-tag">{exercicioAtual.equipamento}</span>
              ) : null}
              {exercicioAtual.dificuldade ? (
                <span className="workout-exec-tag workout-exec-tag--diff">
                  {labelDificuldade(exercicioAtual.dificuldade)}
                </span>
              ) : null}
            </div>
          </section>
        )}

        <div className="workout-exec-actions">
          {phase === "rest" ? (
            <button
              type="button"
              className="workout-exec-btn-secondary"
              onClick={pularDescanso}
              aria-label="Pular descanso e ir para a próxima série"
            >
              <SkipForward size={20} />
              Próxima série
            </button>
          ) : (
            <button
              type="button"
              className="workout-exec-btn-primary"
              onClick={marcarSerieConcluida}
              aria-label="Marcar série como concluída"
            >
              <CheckCircle2 size={20} />
              Série concluída
            </button>
          )}
        </div>

        {proximoExercicio ? (
          <div className="workout-exec-next card">
            <span className="workout-exec-next-label">A seguir</span>
            <div className="workout-exec-next-thumb">
              {proximaMidia ? (
                <img src={proximaMidia} alt="" />
              ) : (
                <ImageIcon size={16} />
              )}
            </div>
            <p className="workout-exec-next-nome">{proximoExercicio.nome}</p>
            <ChevronRight size={16} className="workout-exec-next-chevron" />
          </div>
        ) : null}

        <p className="workout-exec-series-total text-muted">
          {seriesConcluidas} de {totalSeries} séries concluídas
        </p>
      </div>

      <WorkoutSubstituteModal
        open={showSubModal}
        nomeAtual={exercicioAtual.nome}
        substitutos={substitutos}
        loading={loadingSubstitutos}
        onFechar={() => setShowSubModal(false)}
        onSelecionar={substituirExercicio}
      />

      <WorkoutDoneModal
        open={showDoneModal}
        nomeTreino={treino.nome}
        totalExercicios={exercicios.length}
        totalSeries={totalSeries}
        tempoSegundos={sessionSeconds}
        onFinalizar={() => {
          fecharTreinoConcluido();
          onFinalizar();
        }}
      />
    </div>
  );
}
