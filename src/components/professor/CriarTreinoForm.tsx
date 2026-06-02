"use client";

import { Trash2 } from "lucide-react";
import { useCriarTreino } from "@/hooks/useCriarTreino";

interface CriarTreinoFormProps {
  alunoId: string;
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

export function CriarTreinoForm({
  alunoId,
  onCancelar,
  onSucesso,
}: CriarTreinoFormProps) {
  const {
    form,
    errors,
    loadingSubmit,
    feedbackErro,
    handleChange,
    adicionarExercicio,
    removerExercicio,
    handleExercicioChange,
    handleSubmit,
  } = useCriarTreino(alunoId, onSucesso);

  const inputStyle = {
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
    <section
      className="criar-treino-section"
      style={{ backgroundColor: colors.background, color: colors.textPrimary }}
    >
      <div className="criar-treino-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="criar-treino-grid"
        >
          <div>
            <label className="label-campo">Nome do Treino</label>
            <input
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              style={inputStyle}
            />
            {errors.nome ? <p className="erro-campo">{errors.nome}</p> : null}
          </div>

          <div>
            <label className="label-campo">Dia da Semana</label>
            <select
              value={form.diaSemana}
              onChange={(e) => handleChange("diaSemana", e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecione</option>
              <option value="segunda">Segunda</option>
              <option value="terca">Terça</option>
              <option value="quarta">Quarta</option>
              <option value="quinta">Quinta</option>
              <option value="sexta">Sexta</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>
            {errors.diaSemana ? <p className="erro-campo">{errors.diaSemana}</p> : null}
          </div>

          <div className="span-2">
            <div className="exercicios-header">
              <h3 style={{ margin: 0, fontSize: "1rem" }}>Exercícios</h3>
              <button
                type="button"
                onClick={adicionarExercicio}
                className="botao-adicionar"
              >
                + Adicionar Exercício
              </button>
            </div>
          </div>

          {errors.exercicios && errors.exercicios[0]?.nome === "Adicione pelo menos um exercício" ? (
            <p className="span-2 erro-campo" style={{ marginTop: "-4px" }}>
              Adicione pelo menos um exercício
            </p>
          ) : null}

          {form.exercicios.map((exercicio, index) => (
            <div key={exercicio.id} className="span-2 exercicio-card">
              <div className="exercicio-grid">
                <div className="span-2">
                  <div className="titulo-exercicio">
                    <label className="label-campo" style={{ marginBottom: 0 }}>
                      Nome do Exercício
                    </label>
                    <button
                      type="button"
                      onClick={() => removerExercicio(exercicio.id)}
                      className="botao-remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    value={exercicio.nome}
                    onChange={(e) =>
                      handleExercicioChange(exercicio.id, "nome", e.target.value)
                    }
                    style={inputStyle}
                  />
                  {errors.exercicios?.[index]?.nome ? (
                    <p className="erro-campo">{errors.exercicios[index]?.nome}</p>
                  ) : null}
                </div>

                <div className="span-2">
                  <label className="label-campo">Grupo Muscular (opcional)</label>
                  <select
                    value={exercicio.grupoMuscular}
                    onChange={(e) =>
                      handleExercicioChange(
                        exercicio.id,
                        "grupoMuscular",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">Selecione</option>
                    <option value="Peito">Peito</option>
                    <option value="Costas">Costas</option>
                    <option value="Pernas">Pernas</option>
                    <option value="Ombros">Ombros</option>
                    <option value="Bíceps">Bíceps</option>
                    <option value="Tríceps">Tríceps</option>
                    <option value="Abdômen">Abdômen</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="label-campo">Séries</label>
                  <input
                    value={exercicio.series}
                    onChange={(e) =>
                      handleExercicioChange(exercicio.id, "series", e.target.value)
                    }
                    style={inputStyle}
                  />
                  {errors.exercicios?.[index]?.series ? (
                    <p className="erro-campo">{errors.exercicios[index]?.series}</p>
                  ) : null}
                </div>

                <div>
                  <label className="label-campo">Repetições</label>
                  <input
                    value={exercicio.repeticoes}
                    onChange={(e) =>
                      handleExercicioChange(exercicio.id, "repeticoes", e.target.value)
                    }
                    style={inputStyle}
                  />
                  {errors.exercicios?.[index]?.repeticoes ? (
                    <p className="erro-campo">{errors.exercicios[index]?.repeticoes}</p>
                  ) : null}
                </div>

                <div className="span-2">
                  <label className="label-campo">Observação (opcional)</label>
                  <textarea
                    rows={3}
                    value={exercicio.observacao}
                    onChange={(e) =>
                      handleExercicioChange(exercicio.id, "observacao", e.target.value)
                    }
                    style={{ ...inputStyle, minHeight: "96px", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
          ))}

          {feedbackErro ? (
            <p className="span-2 erro-campo" style={{ margin: 0 }}>
              {feedbackErro}
            </p>
          ) : null}

          <div className="span-2 acoes">
            <button type="button" onClick={onCancelar} className="botao-cancelar">
              Cancelar
            </button>
            <button type="submit" className="botao-salvar" disabled={loadingSubmit}>
              {loadingSubmit ? "Salvando..." : "Salvar Treino"}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .criar-treino-section {
          width: 100%;
          padding: 1rem;
          font-family: Inter, sans-serif;
        }
        .criar-treino-container {
          width: 100%;
        }
        .criar-treino-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .label-campo {
          color: ${colors.textSecondary};
          margin-bottom: 6px;
          font-size: 0.9rem;
          display: block;
        }
        .erro-campo {
          margin: 6px 0 0;
          color: ${colors.secondary};
          font-size: 0.85rem;
        }
        .exercicios-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .botao-adicionar {
          min-height: 40px;
          border: none;
          border-radius: 10px;
          background: ${colors.primary};
          color: ${colors.textPrimary};
          padding: 8px 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .exercicio-card {
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: 12px;
          padding: 12px;
        }
        .exercicio-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .titulo-exercicio {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .botao-remover {
          min-height: 36px;
          min-width: 36px;
          border: 1px solid ${colors.secondary};
          border-radius: 8px;
          color: ${colors.secondary};
          background: transparent;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .acoes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .botao-cancelar,
        .botao-salvar {
          min-height: 48px;
          border-radius: 10px;
          font-family: Inter, sans-serif;
          font-weight: 700;
          cursor: pointer;
        }
        .botao-cancelar {
          border: 1px solid ${colors.border};
          background: transparent;
          color: ${colors.textPrimary};
        }
        .botao-salvar {
          border: none;
          background: ${colors.primary};
          color: ${colors.textPrimary};
        }
        @media (min-width: 768px) {
          .criar-treino-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .criar-treino-section {
            padding: 1.5rem 2rem;
          }
        }
        @media (min-width: 1024px) {
          .criar-treino-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .criar-treino-section {
            padding: 2rem 3rem;
          }
          .criar-treino-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 1rem;
            row-gap: 14px;
          }
          .exercicio-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .span-2 {
            grid-column: span 2;
          }
        }
      `}</style>
    </section>
  );
}
