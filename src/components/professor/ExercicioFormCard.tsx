"use client";

import { useState } from "react";
import { ImageIcon, Search, Trash2 } from "lucide-react";
import { ExercicioForm } from "@/types";
import { ExercisePickerModal } from "@/components/professor/ExercisePickerModal";
import { SeriesModeControls } from "@/components/professor/SeriesModeControls";
import { exercicioFormFromCatalogo, sincronizarRepsPorSerie } from "@/lib/form-exercicio";
import { GRUPOS_MUSCULARES } from "@/lib/grupos-musculares";

interface ExercicioFormCardProps {
  exercicio: ExercicioForm;
  index: number;
  errors?: { nome?: string; series?: string; repeticoes?: string };
  onRemover: () => void;
  onChange: (campo: keyof ExercicioForm, valor: string) => void;
  onPatch: (patch: Partial<ExercicioForm>) => void;
  onSubstituirCatalogo: (id: string, exercicio: ExercicioForm) => void;
}

export function ExercicioFormCard({
  exercicio,
  index,
  errors,
  onRemover,
  onChange,
  onPatch,
  onSubstituirCatalogo,
}: ExercicioFormCardProps) {
  const [pickerAberto, setPickerAberto] = useState(false);
  const temCatalogo = Boolean(exercicio.exercicioCatalogoId && exercicio.nome);
  const isPiramide = exercicio.modoSeries === "decrescente";

  const handleCampo = (campo: keyof ExercicioForm, valor: string) => {
    onPatch(
      sincronizarRepsPorSerie({
        ...exercicio,
        [campo]: valor,
      })
    );
  };

  return (
    <>
      <div className="modal-exercicio-item exercicio-form-card">
        <div className="modal-exercicio-header">
          <span className="modal-exercicio-numero" aria-hidden>
            {index + 1}
          </span>
          <p className="modal-exercicio-header-label">Exercício {index + 1}</p>
          <button
            type="button"
            onClick={onRemover}
            className="exercicio-form-remove"
            aria-label="Remover"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="exercicio-form-catalogo">
          {exercicio.imagemUrl ? (
            <img
              src={exercicio.imagemUrl}
              alt=""
              className="exercicio-form-thumb"
              width={56}
              height={56}
            />
          ) : (
            <div className="exercicio-form-thumb exercicio-form-thumb--empty">
              <ImageIcon size={22} />
            </div>
          )}
          <div className="exercicio-form-catalogo-info">
            {temCatalogo ? (
              <>
                <p className="exercicio-form-catalogo-nome">{exercicio.nome}</p>
                <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.8rem" }}>
                  Do catálogo
                </p>
              </>
            ) : (
              <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                Nenhum exercício selecionado
              </p>
            )}
            <button
              type="button"
              className="chip btn-compact"
              style={{ marginTop: "8px" }}
              onClick={() => setPickerAberto(true)}
            >
              <Search size={14} />
              {temCatalogo ? "Trocar exercício" : "Escolher do catálogo"}
            </button>
          </div>
        </div>
        {errors?.nome ? (
          <p className="field-error" style={{ margin: 0 }}>
            {errors.nome}
          </p>
        ) : null}

        <SeriesModeControls
          exercicio={exercicio}
          onPatch={onPatch}
          errors={errors}
          afterToggle={
            <div className="modal-exercicio-campos-row">
              <div>
                <label className="field-label">Séries</label>
                <input
                  className="input-field"
                  value={exercicio.series}
                  onChange={(e) => handleCampo("series", e.target.value)}
                  inputMode="numeric"
                />
                {errors?.series ? <p className="field-error">{errors.series}</p> : null}
              </div>
              {!isPiramide ? (
                <div>
                  <label className="field-label">Repetições</label>
                  <input
                    className="input-field"
                    value={exercicio.repeticoes}
                    onChange={(e) => handleCampo("repeticoes", e.target.value)}
                    inputMode="numeric"
                  />
                  {errors?.repeticoes ? (
                    <p className="field-error">{errors.repeticoes}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          }
        />

        <div className="modal-exercicio-campos-row">
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">Grupo</label>
            <select
              className="input-field"
              value={exercicio.grupoMuscular}
              onChange={(e) => onChange("grupoMuscular", e.target.value)}
            >
              <option value="">Selecione</option>
              {GRUPOS_MUSCULARES.map((g) => (
                <option key={g.id} value={g.label}>
                  {g.label}
                </option>
              ))}
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label">Observação (opcional)</label>
          <textarea
            rows={2}
            className="input-field textarea-field"
            value={exercicio.observacao}
            onChange={(e) => onChange("observacao", e.target.value)}
            style={{ minHeight: "72px" }}
          />
        </div>
      </div>

      <ExercisePickerModal
        open={pickerAberto}
        onFechar={() => setPickerAberto(false)}
        onSelecionar={(item) => {
          const novo = exercicioFormFromCatalogo(item);
          onSubstituirCatalogo(exercicio.id, {
            ...novo,
            id: exercicio.id,
            series: exercicio.series,
            repeticoes: exercicio.repeticoes,
            modoSeries: exercicio.modoSeries,
            passoDecrescente: exercicio.passoDecrescente,
            repeticoesPorSerie: exercicio.repeticoesPorSerie,
            observacao: exercicio.observacao,
          });
        }}
      />
    </>
  );
}
