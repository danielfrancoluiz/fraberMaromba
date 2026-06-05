"use client";

import { useMedicoes } from "@/hooks/useMedicoes";

interface MedicaoFormProps {
  alunoId: string;
  onSalvo?: () => void;
}

export function MedicaoForm({ alunoId, onSalvo }: MedicaoFormProps) {
  const {
    feedbackSucesso,
    feedbackErro,
    form,
    handleChange,
    handleSubmit,
  } = useMedicoes(alunoId, { onSalvo });

  return (
    <form
      className="form-grid form-grid--2"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      <div>
        <label className="field-label" htmlFor="medicao-peso">
          Peso (kg)
        </label>
        <input
          id="medicao-peso"
          type="text"
          className="input-field"
          value={form.peso}
          onChange={(e) => handleChange("peso", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="medicao-cintura">
          Cintura (cm)
        </label>
        <input
          id="medicao-cintura"
          type="text"
          className="input-field"
          value={form.cintura}
          onChange={(e) => handleChange("cintura", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="medicao-quadril">
          Quadril (cm)
        </label>
        <input
          id="medicao-quadril"
          type="text"
          className="input-field"
          value={form.quadril}
          onChange={(e) => handleChange("quadril", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="medicao-braco-d">
          Braço direito (cm)
        </label>
        <input
          id="medicao-braco-d"
          type="text"
          className="input-field"
          value={form.bracoDireito}
          onChange={(e) => handleChange("bracoDireito", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="medicao-braco-e">
          Braço esquerdo (cm)
        </label>
        <input
          id="medicao-braco-e"
          type="text"
          className="input-field"
          value={form.bracoEsquerdo}
          onChange={(e) => handleChange("bracoEsquerdo", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="medicao-coxa-d">
          Coxa direita (cm)
        </label>
        <input
          id="medicao-coxa-d"
          type="text"
          className="input-field"
          value={form.coxaDireita}
          onChange={(e) => handleChange("coxaDireita", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="medicao-coxa-e">
          Coxa esquerda (cm)
        </label>
        <input
          id="medicao-coxa-e"
          type="text"
          className="input-field"
          value={form.coxaEsquerda}
          onChange={(e) => handleChange("coxaEsquerda", e.target.value)}
        />
      </div>
      <div className="field-span2">
        <label className="field-label" htmlFor="medicao-obs">
          Observação
        </label>
        <textarea
          id="medicao-obs"
          className="input-field textarea-field"
          value={form.observacao}
          onChange={(e) => handleChange("observacao", e.target.value)}
          rows={3}
          style={{ minHeight: "80px" }}
        />
      </div>

      {feedbackSucesso ? (
        <p className="field-span2 auth-alert auth-alert--success">{feedbackSucesso}</p>
      ) : null}

      {feedbackErro ? (
        <p className="field-span2 auth-alert auth-alert--error">{feedbackErro}</p>
      ) : null}

      <button type="submit" className="btn-primary field-span2">
        Salvar medição
      </button>
    </form>
  );
}
