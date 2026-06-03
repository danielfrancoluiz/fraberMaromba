"use client";

import { AlertTriangle, X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  mensagem: string;
  confirmarLabel?: string;
  cancelarLabel?: string;
  loading?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  open,
  titulo,
  mensagem,
  confirmarLabel = "Confirmar",
  cancelarLabel = "Cancelar",
  loading = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <ModalPortal>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="modal-overlay"
        onClick={onCancelar}
      >
        <div className="card confirm-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-form-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="confirm-dialog-icon" aria-hidden>
                <AlertTriangle size={22} />
              </div>
              <h2 id="confirm-dialog-title" style={{ margin: 0, fontSize: "1.05rem" }}>
                {titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancelar}
              aria-label="Fechar"
              className="modal-close-btn"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-muted" style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", lineHeight: 1.5 }}>
            {mensagem}
          </p>

          <div className="confirm-dialog-actions">
            <button
              type="button"
              className="chip"
              style={{ minHeight: "48px", flex: 1 }}
              onClick={onCancelar}
              disabled={loading}
            >
              {cancelarLabel}
            </button>
            <button
              type="button"
              className="btn-primary confirm-dialog-btn-danger"
              style={{ flex: 1 }}
              onClick={onConfirmar}
              disabled={loading}
            >
              {loading ? "Excluindo..." : confirmarLabel}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
