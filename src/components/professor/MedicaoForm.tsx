"use client";

import { Ruler } from "lucide-react";
import { useMedicoes } from "@/hooks/useMedicoes";

interface MedicaoFormProps {
  alunoId: string;
  onSalvo?: () => void;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
  success: "#22c55e",
};

const inputStyle: React.CSSProperties = {
  minHeight: "48px",
  width: "100%",
  borderRadius: "10px",
  border: `1px solid ${colors.border}`,
  backgroundColor: "#0D1B2E",
  color: colors.textPrimary,
  padding: "10px 12px",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

export function MedicaoForm({ alunoId, onSalvo }: MedicaoFormProps) {
  const {
    feedbackSucesso,
    feedbackErro,
    form,
    handleChange,
    handleSubmit,
  } = useMedicoes(alunoId, { onSalvo });

  return (
    <section className="medicao-form">
      <h2
        style={{
          margin: "0 0 1rem",
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Ruler size={22} color={colors.primary} />
        Nova Medição
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="medicao-form-grid"
      >
        <div>
          <label style={labelStyle}>Peso (kg)</label>
          <input
            type="text"
            value={form.peso}
            onChange={(e) => handleChange("peso", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Cintura (cm)</label>
          <input
            type="text"
            value={form.cintura}
            onChange={(e) => handleChange("cintura", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Quadril (cm)</label>
          <input
            type="text"
            value={form.quadril}
            onChange={(e) => handleChange("quadril", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Braço Direito (cm)</label>
          <input
            type="text"
            value={form.bracoDireito}
            onChange={(e) => handleChange("bracoDireito", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Braço Esquerdo (cm)</label>
          <input
            type="text"
            value={form.bracoEsquerdo}
            onChange={(e) => handleChange("bracoEsquerdo", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Coxa Direita (cm)</label>
          <input
            type="text"
            value={form.coxaDireita}
            onChange={(e) => handleChange("coxaDireita", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Coxa Esquerda (cm)</label>
          <input
            type="text"
            value={form.coxaEsquerda}
            onChange={(e) => handleChange("coxaEsquerda", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div className="medicao-observacao">
          <label style={labelStyle}>Observação</label>
          <textarea
            value={form.observacao}
            onChange={(e) => handleChange("observacao", e.target.value)}
            rows={3}
            style={{
              ...inputStyle,
              minHeight: "80px",
              resize: "vertical",
            }}
          />
        </div>

        {feedbackSucesso ? (
          <p
            className="medicao-feedback"
            style={{ margin: 0, color: colors.success, fontSize: "0.9rem" }}
          >
            Medição salva com sucesso!
          </p>
        ) : null}

        {feedbackErro ? (
          <p
            className="medicao-feedback"
            style={{ margin: 0, color: colors.secondary, fontSize: "0.9rem" }}
          >
            {feedbackErro}
          </p>
        ) : null}

        <button
          type="submit"
          className="medicao-submit"
          style={{
            minHeight: "48px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Salvar Medição
        </button>
      </form>

      <style jsx global>{`
        .medicao-form {
          width: 100%;
          padding: 1rem;
        }
        .medicao-form-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .medicao-form {
            max-width: 600px;
            margin: 0 auto;
          }
        }
        @media (min-width: 1024px) {
          .medicao-form {
            max-width: 800px;
          }
          .medicao-form-grid {
            grid-template-columns: 1fr 1fr;
          }
          .medicao-observacao,
          .medicao-feedback,
          .medicao-submit {
            grid-column: span 2;
          }
        }
      `}</style>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#7A9CC4",
  fontSize: "0.9rem",
  marginBottom: "6px",
  fontFamily: "Inter, sans-serif",
};
