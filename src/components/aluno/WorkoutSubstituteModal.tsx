"use client";

import { ArrowLeftRight, X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { ExercicioSubstituto } from "@/types";
import { ExercicioMidia } from "@/components/exercicio/ExercicioMidia";

interface WorkoutSubstituteModalProps {
  open: boolean;
  nomeAtual: string;
  substitutos: ExercicioSubstituto[];
  loading: boolean;
  onFechar: () => void;
  onSelecionar: (item: ExercicioSubstituto) => void;
}

export function WorkoutSubstituteModal({
  open,
  nomeAtual,
  substitutos,
  loading,
  onFechar,
  onSelecionar,
}: WorkoutSubstituteModalProps) {
  if (!open) return null;

  return (
    <ModalPortal>
      <div className="workout-modal-overlay" onClick={onFechar} role="presentation">
        <div
          className="workout-modal card"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="workout-sub-title"
        >
          <div className="workout-modal-header">
            <h2 id="workout-sub-title" className="workout-modal-title">
              Substituir exercício
            </h2>
            <button
              type="button"
              className="workout-modal-close"
              onClick={onFechar}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          <p className="workout-modal-desc text-muted">
            Alternativas para <strong>{nomeAtual}</strong>
          </p>

          <div className="workout-sub-lista">
            {loading ? (
              <p className="text-muted workout-sub-empty">Carregando alternativas...</p>
            ) : substitutos.length === 0 ? (
              <p className="text-muted workout-sub-empty">
                Nenhum substituto neste grupo muscular.
              </p>
            ) : (
              substitutos.map((item) => (
                <SubstituteItem
                  key={item.id}
                  item={item}
                  onSelecionar={onSelecionar}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function SubstituteItem({
  item,
  onSelecionar,
}: {
  item: ExercicioSubstituto;
  onSelecionar: (item: ExercicioSubstituto) => void;
}) {
  const midiaUrl = item.gifUrl ?? item.imagemUrl ?? null;

  return (
    <button
      type="button"
      className="workout-sub-item"
      onClick={() => onSelecionar(item)}
    >
      <div className="workout-sub-thumb">
        {midiaUrl ? (
          <ExercicioMidia
            url={midiaUrl}
            alt={item.nome}
            compact
            mediaClassName="workout-sub-thumb-media"
          />
        ) : (
          <span className="workout-sub-thumb-placeholder">?</span>
        )}
      </div>
      <div className="workout-sub-info">
        <p className="workout-sub-item-title">{item.nome}</p>
        <p className="workout-sub-item-meta">
          {item.equipamento ?? item.grupoMuscular}
        </p>
      </div>
      <ArrowLeftRight size={18} className="text-accent" />
    </button>
  );
}
