"use client";

import { CheckCircle2 } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { formatTime } from "@/hooks/useTimer";

interface WorkoutDoneModalProps {
  open: boolean;
  nomeTreino: string;
  totalExercicios: number;
  totalSeries: number;
  tempoSegundos: number;
  onFinalizar: () => void;
}

export function WorkoutDoneModal({
  open,
  nomeTreino,
  totalExercicios,
  totalSeries,
  tempoSegundos,
  onFinalizar,
}: WorkoutDoneModalProps) {
  if (!open) return null;

  return (
    <ModalPortal>
      <div className="workout-modal-overlay workout-done-overlay" role="presentation">
        <div className="workout-done-modal card" role="dialog" aria-modal="true">
          <div className="workout-done-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.5rem", textAlign: "center" }}>
            Treino concluído!
          </h2>
          <p className="text-muted" style={{ margin: "0 0 20px", textAlign: "center", fontSize: "0.9rem" }}>
            Parabéns! Você completou {nomeTreino}
          </p>

          <div className="workout-done-stats">
            <div>
              <strong>{totalExercicios}</strong>
              <span>Exercícios</span>
            </div>
            <div>
              <strong>{totalSeries}</strong>
              <span>Séries</span>
            </div>
            <div>
              <strong>{formatTime(tempoSegundos)}</strong>
              <span>Tempo</span>
            </div>
          </div>

          <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={onFinalizar}>
            Finalizar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
