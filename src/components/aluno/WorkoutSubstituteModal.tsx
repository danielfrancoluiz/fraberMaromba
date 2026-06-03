"use client";

import { ArrowLeftRight, X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { ExercicioSubstituto } from "@/types";
import { urlMidiaSubstituto } from "@/lib/exercicio-media";

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
            <h2 id="workout-sub-title" style={{ margin: 0, fontSize: "1.1rem" }}>
              Substituir exercício
            </h2>
            <button type="button" className="workout-modal-close" onClick={onFechar} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          <p className="text-muted" style={{ margin: "0 0 12px", fontSize: "0.875rem" }}>
            Alternativas para <strong style={{ color: "var(--fraber-text)" }}>{nomeAtual}</strong>
          </p>

          <div className="workout-sub-lista">
            {loading ? (
              <p className="text-muted" style={{ textAlign: "center", padding: "1.5rem 0" }}>
                Carregando alternativas...
              </p>
            ) : substitutos.length === 0 ? (
              <p className="text-muted" style={{ textAlign: "center", padding: "1.5rem 0" }}>
                Nenhum substituto neste grupo muscular.
              </p>
            ) : (
              substitutos.map((item) => {
                const img = urlMidiaSubstituto(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="workout-sub-item"
                    onClick={() => onSelecionar(item)}
                  >
                    <div className="workout-sub-thumb">
                      {img ? (
                        <img src={img} alt="" />
                      ) : (
                        <span className="workout-sub-thumb-placeholder">?</span>
                      )}
                    </div>
                    <div className="workout-sub-info">
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>{item.nome}</p>
                      <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.75rem" }}>
                        {item.equipamento ?? item.grupoMuscular}
                      </p>
                    </div>
                    <ArrowLeftRight size={18} className="text-accent" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
