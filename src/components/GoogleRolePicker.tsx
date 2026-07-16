"use client";

import type { GoogleRoleIntent } from "@/lib/google-role-cookie-name";

interface GoogleRolePickerProps {
  value: GoogleRoleIntent;
  onChange: (role: GoogleRoleIntent) => void;
  /** Quando true, aluno já vem de convite e não pode mudar. */
  alunoFixo?: boolean;
}

export function GoogleRolePicker({
  value,
  onChange,
  alunoFixo = false,
}: GoogleRolePickerProps) {
  return (
    <div className="auth-role-picker">
      <p className="field-label" style={{ marginBottom: 8 }}>
        Como você quer entrar?
      </p>
      <div className="series-mode-toggle" role="group" aria-label="Tipo de conta">
        <button
          type="button"
          className={`series-mode-btn${value === "professor" ? " series-mode-btn--active" : ""}`}
          onClick={() => onChange("professor")}
          disabled={alunoFixo}
        >
          Professor
        </button>
        <button
          type="button"
          className={`series-mode-btn${value === "aluno" ? " series-mode-btn--active" : ""}`}
          onClick={() => onChange("aluno")}
        >
          Aluno
        </button>
      </div>
      {value === "aluno" && !alunoFixo ? (
        <p className="text-muted auth-role-hint">
          Aluno precisa do link de convite do professor. Peça o link e abra
          pelo cadastro do convite.
        </p>
      ) : null}
      {alunoFixo ? (
        <p className="text-muted auth-role-hint">
          Conta de aluno vinculada ao convite do professor.
        </p>
      ) : null}
    </div>
  );
}
