"use client";

import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { ExercicioForm, ModoSeriesForm } from "@/types";
import { setRepsDaSerie, sincronizarRepsPorSerie } from "@/lib/form-exercicio";

interface SeriesModeControlsProps {
  exercicio: ExercicioForm;
  onPatch: (patch: Partial<ExercicioForm>) => void;
  /** Conteúdo entre o toggle e as reps por série (séries / reps / descanso). */
  afterToggle?: ReactNode;
  /** Layout compacto (montar treino) com counters +/-. */
  compact?: boolean;
  errors?: { series?: string; repeticoes?: string };
}

export function SeriesModeControls({
  exercicio,
  onPatch,
  afterToggle,
  compact = false,
  errors,
}: SeriesModeControlsProps) {
  const isPiramide = exercicio.modoSeries === "decrescente";
  const sync = isPiramide ? sincronizarRepsPorSerie(exercicio) : exercicio;
  const lista = sync.repeticoesPorSerie ?? [];

  const setModo = (modo: ModoSeriesForm) => {
    if (modo === "decrescente") {
      onPatch(
        sincronizarRepsPorSerie({
          ...exercicio,
          modoSeries: "decrescente",
        })
      );
      return;
    }
    onPatch({
      modoSeries: "iguais",
      repeticoesPorSerie: undefined,
    });
  };

  const ajustarRepSerie = (setIdx: number, delta: number) => {
    const atual =
      lista[setIdx] ?? (Number.parseInt(exercicio.repeticoes, 10) || 12);
    onPatch(setRepsDaSerie(exercicio, setIdx, atual + delta));
  };

  const setRepSerieInput = (setIdx: number, raw: string) => {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    onPatch(setRepsDaSerie(exercicio, setIdx, n));
  };

  return (
    <div className={compact ? "series-mode series-mode--compact" : "series-mode"}>
      <div className="series-mode-toggle" role="group" aria-label="Tipo de séries">
        <button
          type="button"
          className={`series-mode-btn${exercicio.modoSeries !== "decrescente" ? " series-mode-btn--active" : ""}`}
          onClick={() => setModo("iguais")}
        >
          Normal
        </button>
        <button
          type="button"
          className={`series-mode-btn${isPiramide ? " series-mode-btn--active" : ""}`}
          onClick={() => setModo("decrescente")}
        >
          Pirâmide Decrescente
        </button>
      </div>

      {afterToggle}

      {isPiramide && lista.length > 0 ? (
        <div className="series-piramide-reps">
          <p className="field-label" style={{ margin: 0 }}>
            Repetições por série
          </p>
          {compact ? (
            <div className="series-piramide-grid">
              {lista.map((reps, idx) => (
                <div key={idx} className="montar-treino-counter-card">
                  <span className="montar-treino-counter-label">Série {idx + 1}</span>
                  <div className="montar-treino-counter-controls">
                    <button
                      type="button"
                      className="montar-treino-counter-btn"
                      onClick={() => ajustarRepSerie(idx, -1)}
                      aria-label={`Diminuir reps da série ${idx + 1}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="montar-treino-counter-val">{reps}</span>
                    <button
                      type="button"
                      className="montar-treino-counter-btn"
                      onClick={() => ajustarRepSerie(idx, 1)}
                      aria-label={`Aumentar reps da série ${idx + 1}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="series-piramide-inputs">
              {lista.map((reps, idx) => (
                <div key={idx}>
                  <label className="field-label">Série {idx + 1}</label>
                  <input
                    className="input-field"
                    value={String(reps)}
                    onChange={(e) => setRepSerieInput(idx, e.target.value)}
                    inputMode="numeric"
                  />
                  {idx === 0 && errors?.repeticoes ? (
                    <p className="field-error">{errors.repeticoes}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
