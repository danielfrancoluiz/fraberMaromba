"use client";

import { Minus, Plus } from "lucide-react";
import { ExercicioForm, ModoSeriesForm } from "@/types";
import { sincronizarRepsPorSerie } from "@/lib/form-exercicio";

interface SeriesModeControlsProps {
  exercicio: ExercicioForm;
  onChange: (campo: keyof ExercicioForm, valor: string) => void;
  onPatch: (patch: Partial<ExercicioForm>) => void;
  /** Quando true, usa layout compacto com chips (montar treino). */
  compact?: boolean;
  /** Ajuste +/- do passo no modo compacto (montar treino). */
  onAjustarPasso?: (delta: number) => void;
  errors?: { series?: string; repeticoes?: string };
}

export function SeriesModeControls({
  exercicio,
  onChange,
  onPatch,
  compact = false,
  onAjustarPasso,
  errors,
}: SeriesModeControlsProps) {
  const sync = sincronizarRepsPorSerie(exercicio);
  const isPiramide = exercicio.modoSeries === "decrescente";
  const preview =
    isPiramide && sync.repeticoesPorSerie?.length
      ? sync.repeticoesPorSerie.join(" → ")
      : null;

  const setModo = (modo: ModoSeriesForm) => {
    onPatch(
      sincronizarRepsPorSerie({
        ...exercicio,
        modoSeries: modo,
      })
    );
  };

  return (
    <div className={compact ? "series-mode series-mode--compact" : "series-mode"}>
      <div className="series-mode-toggle" role="group" aria-label="Tipo de séries">
        <button
          type="button"
          className={`series-mode-btn${exercicio.modoSeries === "iguais" ? " series-mode-btn--active" : ""}`}
          onClick={() => setModo("iguais")}
        >
          Iguais
        </button>
        <button
          type="button"
          className={`series-mode-btn${isPiramide ? " series-mode-btn--active" : ""}`}
          onClick={() => setModo("decrescente")}
        >
          Pirâmide Decrescente
        </button>
      </div>

      {!compact ? (
        <div className="modal-exercicio-campos-row">
          <div>
            <label className="field-label">Séries</label>
            <input
              className="input-field"
              value={exercicio.series}
              onChange={(e) => onChange("series", e.target.value)}
              inputMode="numeric"
            />
            {errors?.series ? <p className="field-error">{errors.series}</p> : null}
          </div>
          <div>
            <label className="field-label">Repetições</label>
            <input
              className="input-field"
              value={exercicio.repeticoes}
              onChange={(e) => onChange("repeticoes", e.target.value)}
              inputMode="numeric"
            />
            {errors?.repeticoes ? (
              <p className="field-error">{errors.repeticoes}</p>
            ) : null}
          </div>
          {isPiramide ? (
            <div>
              <label className="field-label">Passo (−)</label>
              <input
                className="input-field"
                value={exercicio.passoDecrescente}
                onChange={(e) => onChange("passoDecrescente", e.target.value)}
                inputMode="numeric"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {compact && isPiramide && onAjustarPasso ? (
        <div className="series-mode-passo-row">
          <div className="montar-treino-counter-card" style={{ maxWidth: 160 }}>
            <span className="montar-treino-counter-label">Passo (−)</span>
            <div className="montar-treino-counter-controls">
              <button
                type="button"
                className="montar-treino-counter-btn"
                onClick={() => onAjustarPasso(-1)}
                aria-label="Diminuir passo"
              >
                <Minus size={14} />
              </button>
              <span className="montar-treino-counter-val">
                {exercicio.passoDecrescente}
              </span>
              <button
                type="button"
                className="montar-treino-counter-btn"
                onClick={() => onAjustarPasso(1)}
                aria-label="Aumentar passo"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {preview ? (
        <p className="series-mode-preview text-muted" aria-live="polite">
          Prévia: {preview}
        </p>
      ) : null}
    </div>
  );
}
