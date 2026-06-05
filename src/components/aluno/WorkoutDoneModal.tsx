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
          <h2 className="workout-done-title">Treino concluído!</h2>
          <p className="workout-done-subtitle">
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

          <button type="button" className="btn-primary workout-done-btn" onClick={onFinalizar}>
            Finalizar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
