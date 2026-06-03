"use client";

import { ArrowLeft } from "lucide-react";
import { useCriarTemplate } from "@/hooks/useCriarTemplate";
import { ExercicioFormCard } from "@/components/professor/ExercicioFormCard";
import { ExercisePickerModal } from "@/components/professor/ExercisePickerModal";

interface CriarTemplateFormProps {
  onCancelar: () => void;
  onSucesso: () => void;
}

const colors = {
  background: "#0D1B2E",
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

export function CriarTemplateForm({ onCancelar, onSucesso }: CriarTemplateFormProps) {
  const {
    form,
    errors,
    loadingSubmit,
    feedbackErro,
    pickerAberto,
    setPickerAberto,
    handleChange,
    adicionarDoCatalogo,
    removerExercicio,
    substituirCatalogo,
    handleExercicioChange,
    handleSubmit,
  } = useCriarTemplate(onSucesso);

  const inputStyle: React.CSSProperties = {
    minHeight: "48px",
    width: "100%",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    padding: "10px 12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.95rem",
  };

  return (
    <section className="ctf-section" style={{ backgroundColor: colors.background }}>
      <div className="ctf-container">
        <header className="ctf-header">
          <button type="button" onClick={onCancelar} className="ctf-voltar" aria-label="Voltar">
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ margin: 0, color: colors.textPrimary, fontSize: "1.2rem" }}>
            Novo Template
          </h2>
        </header>

        <form
          className="ctf-grid"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="ctf-span-2">
            <label className="ctf-label">Nome do Template</label>
            <input
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              style={inputStyle}
            />
            {errors.nome ? <p className="ctf-erro">{errors.nome}</p> : null}
          </div>

          <div className="ctf-span-2">
            <label className="ctf-label">Descrição (opcional)</label>
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              style={{ ...inputStyle, minHeight: "96px", resize: "vertical" }}
            />
            {errors.descricao ? <p className="ctf-erro">{errors.descricao}</p> : null}
          </div>

          <div className="ctf-span-2 ctf-exercicios-header">
            <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: "1rem" }}>
              Exercícios
            </h3>
            <button
              type="button"
              onClick={() => setPickerAberto(true)}
              className="ctf-add-btn"
            >
              + Adicionar Exercício
            </button>
          </div>

          {form.exercicios.map((exercicio, index) => (
            <div key={exercicio.id} className="ctf-span-2">
              <ExercicioFormCard
                exercicio={exercicio}
                index={index}
                inputStyle={inputStyle}
                errors={errors.exercicios?.[index]}
                onRemover={() => removerExercicio(exercicio.id)}
                onChange={(campo, valor) =>
                  handleExercicioChange(exercicio.id, campo, valor)
                }
                onSubstituirCatalogo={substituirCatalogo}
              />
            </div>
          ))}

          {errors.geral ? (
            <p className="ctf-span-2 ctf-erro" style={{ margin: 0 }}>
              {errors.geral}
            </p>
          ) : null}
          {feedbackErro ? (
            <p className="ctf-span-2 ctf-erro" style={{ margin: 0 }}>
              {feedbackErro}
            </p>
          ) : null}

          <div className="ctf-span-2 ctf-acoes">
            <button type="button" onClick={onCancelar} className="ctf-cancelar-btn">
              Cancelar
            </button>
            <button type="submit" className="ctf-submit-btn" disabled={loadingSubmit}>
              {loadingSubmit ? "Salvando..." : "Salvar Template"}
            </button>
          </div>
        </form>
      </div>

      <ExercisePickerModal
        open={pickerAberto}
        onFechar={() => setPickerAberto(false)}
        onSelecionar={(item) => {
          adicionarDoCatalogo(item);
          setPickerAberto(false);
        }}
      />

      <style jsx global>{`
        .ctf-section {
          width: 100%;
          padding: 1rem;
          font-family: Inter, sans-serif;
        }
        .ctf-container {
          width: 100%;
        }
        .ctf-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .ctf-voltar {
          min-height: 40px;
          min-width: 40px;
          border-radius: 10px;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          color: ${colors.textPrimary};
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .ctf-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .ctf-label {
          color: ${colors.textSecondary};
          margin-bottom: 6px;
          font-size: 0.9rem;
          display: block;
        }
        .ctf-erro {
          margin: 6px 0 0;
          color: ${colors.secondary};
          font-size: 0.85rem;
        }
        .ctf-exercicios-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .ctf-add-btn {
          min-height: 40px;
          border: none;
          border-radius: 10px;
          background: ${colors.primary};
          color: ${colors.textPrimary};
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          font-family: Inter, sans-serif;
        }
        .ctf-acoes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .ctf-cancelar-btn,
        .ctf-submit-btn {
          min-height: 48px;
          border-radius: 10px;
          font-family: Inter, sans-serif;
          font-weight: 700;
          cursor: pointer;
        }
        .ctf-cancelar-btn {
          border: 1px solid ${colors.border};
          background: transparent;
          color: ${colors.textPrimary};
        }
        .ctf-submit-btn {
          border: none;
          background: ${colors.primary};
          color: ${colors.textPrimary};
        }
        @media (min-width: 768px) {
          .ctf-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .ctf-section {
            padding: 1.5rem 2rem;
          }
        }
        @media (min-width: 1024px) {
          .ctf-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .ctf-section {
            padding: 2rem 3rem;
          }
          .ctf-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 1rem;
            row-gap: 14px;
          }
          .ctf-span-2 {
            grid-column: span 2;
          }
        }
      `}</style>
    </section>
  );
}
