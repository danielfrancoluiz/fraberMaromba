"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useMontarTreino } from "@/hooks/useMontarTreino";
import { ExercisePickerModal } from "@/components/professor/ExercisePickerModal";
import { OBJETIVOS_TREINO } from "@/lib/treino-objetivos";

interface MontarTreinoBuilderProps {
  treinoId?: string;
  alunoIdInicial?: string;
  alunoIdFixo?: boolean;
  titulo?: string;
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

export function MontarTreinoBuilder({
  treinoId,
  alunoIdInicial,
  alunoIdFixo = false,
  titulo,
  onCancelar,
  onSucesso,
}: MontarTreinoBuilderProps) {
  const {
    form,
    errors,
    alunos,
    loadingAlunos,
    loadingTreino,
    loadingSubmit,
    feedbackErro,
    modoEdicao,
    pickerAberto,
    setPickerAberto,
    handleChange,
    adicionarDoCatalogo,
    removerExercicio,
    moverExercicio,
    ajustarExercicio,
    handleExercicioChange,
    handleSubmit,
  } = useMontarTreino({ treinoId, alunoIdInicial, onSucesso });

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

  const tituloPagina =
    titulo ?? (modoEdicao ? "Editar Treino" : "Montar Treino");

  if (loadingTreino) {
    return (
      <main className="montar-treino-page">
        <p className="text-muted" style={{ textAlign: "center", marginTop: "3rem" }}>
          Carregando treino...
        </p>
      </main>
    );
  }

  return (
    <main className="montar-treino-page">
      <header className="montar-treino-header">
        <button
          type="button"
          onClick={onCancelar}
          className="montar-treino-voltar"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="montar-treino-title">{tituloPagina}</h1>
      </header>

      <form
        className="montar-treino-form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <section className="card montar-treino-card">
          <div className="montar-treino-fields">
            <div>
              <label className="label-campo">Nome do treino</label>
              <input
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Ex: Treino A — Peito"
                style={inputStyle}
              />
              {errors.nome ? <p className="erro-campo">{errors.nome}</p> : null}
            </div>

            <div>
              <label className="label-campo">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                placeholder="Descreva o treino..."
                rows={2}
                style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
              />
            </div>

            <div>
              <label className="label-campo">Objetivo / meta</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.objetivo}
                  onChange={(e) => handleChange("objetivo", e.target.value)}
                  style={{ ...inputStyle, appearance: "none", paddingRight: "36px" }}
                >
                  {OBJETIVOS_TREINO.map((o) => (
                    <option key={o.value || "vazio"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.textSecondary,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label className="label-campo">Aluno</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.alunoId}
                  onChange={(e) => handleChange("alunoId", e.target.value)}
                  disabled={alunoIdFixo || loadingAlunos}
                  style={{ ...inputStyle, appearance: "none", paddingRight: "36px" }}
                >
                  <option value="" disabled>
                    {loadingAlunos ? "Carregando..." : "Selecione um aluno"}
                  </option>
                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nomeCompleto}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.textSecondary,
                    pointerEvents: "none",
                  }}
                />
              </div>
              {errors.alunoId ? <p className="erro-campo">{errors.alunoId}</p> : null}
            </div>

            <div>
              <label className="label-campo">Dia da semana</label>
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
          </div>
        </section>

        <div className="montar-treino-exercicios-bar">
          <h2 className="montar-treino-section-label">Exercícios</h2>
          <button
            type="button"
            className="montar-treino-add-btn"
            onClick={() => setPickerAberto(true)}
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>

        {errors.exercicios?.[0]?.nome === "Adicione pelo menos um exercício" ? (
          <p className="erro-campo" style={{ margin: 0 }}>
            Adicione pelo menos um exercício
          </p>
        ) : null}

        {form.exercicios.length === 0 ? (
          <section className="card montar-treino-empty">
            <p className="text-muted" style={{ margin: 0 }}>
              Nenhum exercício adicionado
            </p>
            <button
              type="button"
              className="chip"
              style={{ marginTop: "12px" }}
              onClick={() => setPickerAberto(true)}
            >
              Adicionar exercício
            </button>
          </section>
        ) : (
          <ul className="montar-treino-lista">
            {form.exercicios.map((exercicio, idx) => (
              <li key={exercicio.id} className="card montar-treino-ex-item">
                <div className="montar-treino-ex-row">
                  <div className="montar-treino-grip-col">
                    <div className="montar-treino-grip" aria-hidden>
                      <GripVertical size={14} />
                    </div>
                    <div className="montar-treino-reorder">
                      <button
                        type="button"
                        className="montar-treino-step-btn"
                        disabled={idx === 0}
                        onClick={() => moverExercicio(idx, "cima")}
                        aria-label="Subir"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="montar-treino-step-btn"
                        disabled={idx === form.exercicios.length - 1}
                        onClick={() => moverExercicio(idx, "baixo")}
                        aria-label="Descer"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="montar-treino-ex-body">
                    <div className="montar-treino-ex-top">
                      {exercicio.imagemUrl ? (
                        <img
                          src={exercicio.imagemUrl}
                          alt=""
                          className="montar-treino-thumb"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="montar-treino-thumb montar-treino-thumb--empty" />
                      )}
                      <p className="montar-treino-ex-nome">{exercicio.nome || "—"}</p>
                      <button
                        type="button"
                        className="montar-treino-remove"
                        onClick={() => removerExercicio(exercicio.id)}
                        aria-label="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="montar-treino-counters">
                      <CounterGroup
                        label="Séries"
                        value={exercicio.series}
                        onMinus={() => ajustarExercicio(exercicio.id, "series", -1)}
                        onPlus={() => ajustarExercicio(exercicio.id, "series", 1)}
                      />
                      <CounterGroup
                        label="Reps"
                        value={exercicio.repeticoes}
                        onMinus={() => ajustarExercicio(exercicio.id, "repeticoes", -1)}
                        onPlus={() => ajustarExercicio(exercicio.id, "repeticoes", 1)}
                      />
                      <CounterGroup
                        label="Descanso"
                        value={`${exercicio.restSeconds}s`}
                        onMinus={() => ajustarExercicio(exercicio.id, "restSeconds", -5)}
                        onPlus={() => ajustarExercicio(exercicio.id, "restSeconds", 5)}
                      />
                    </div>

                    <input
                      type="text"
                      value={exercicio.observacao}
                      onChange={(e) =>
                        handleExercicioChange(exercicio.id, "observacao", e.target.value)
                      }
                      placeholder="Observação (opcional)"
                      className="montar-treino-obs"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {feedbackErro ? (
          <p className="erro-campo" style={{ margin: 0 }}>
            {feedbackErro}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-primary montar-treino-salvar"
          disabled={
            loadingSubmit ||
            !form.nome.trim() ||
            !form.alunoId ||
            !form.diaSemana ||
            form.exercicios.length === 0
          }
        >
          <Check size={18} />
          {loadingSubmit ? "Salvando..." : modoEdicao ? "Salvar alterações" : "Salvar treino"}
        </button>
      </form>

      <ExercisePickerModal
        open={pickerAberto}
        onFechar={() => setPickerAberto(false)}
        onSelecionar={(item) => {
          adicionarDoCatalogo(item);
          setPickerAberto(false);
        }}
      />

      <style jsx global>{`
        .montar-treino-page {
          min-height: 100vh;
          background: ${colors.background};
          color: ${colors.textPrimary};
          font-family: Inter, sans-serif;
          padding: 1rem 1rem 6rem;
          max-width: 640px;
          margin: 0 auto;
        }
        .montar-treino-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.25rem;
        }
        .montar-treino-voltar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          color: ${colors.textPrimary};
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .montar-treino-title {
          margin: 0;
          font-size: 1.25rem;
        }
        .montar-treino-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .montar-treino-card {
          padding: 14px;
        }
        .montar-treino-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .label-campo {
          color: ${colors.textSecondary};
          font-size: 0.85rem;
          margin-bottom: 6px;
          display: block;
        }
        .erro-campo {
          color: ${colors.secondary};
          font-size: 0.85rem;
          margin: 6px 0 0;
        }
        .montar-treino-exercicios-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .montar-treino-section-label {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${colors.textSecondary};
        }
        .montar-treino-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 36px;
          padding: 0 12px;
          border: none;
          border-radius: 10px;
          background: ${colors.primary};
          color: ${colors.textPrimary};
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .montar-treino-empty {
          text-align: center;
          padding: 2rem 1rem;
        }
        .montar-treino-lista {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .montar-treino-ex-item {
          padding: 12px;
        }
        .montar-treino-ex-row {
          display: flex;
          gap: 10px;
        }
        .montar-treino-grip-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .montar-treino-grip {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #0a1525;
          display: grid;
          place-items: center;
          color: ${colors.textSecondary};
        }
        .montar-treino-reorder {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .montar-treino-step-btn {
          width: 28px;
          height: 24px;
          border: 1px solid ${colors.border};
          border-radius: 6px;
          background: ${colors.surface};
          color: ${colors.textPrimary};
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .montar-treino-step-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .montar-treino-ex-body {
          flex: 1;
          min-width: 0;
        }
        .montar-treino-ex-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .montar-treino-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
          background: #0a1525;
        }
        .montar-treino-thumb--empty {
          border: 1px dashed ${colors.border};
        }
        .montar-treino-ex-nome {
          flex: 1;
          margin: 0;
          font-weight: 600;
          font-size: 0.95rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .montar-treino-remove {
          border: none;
          background: transparent;
          color: ${colors.textSecondary};
          padding: 4px;
          cursor: pointer;
        }
        .montar-treino-remove:hover {
          color: ${colors.secondary};
        }
        .montar-treino-counters {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 16px;
          margin-bottom: 10px;
        }
        .montar-treino-counter {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .montar-treino-counter-label {
          font-size: 0.75rem;
          color: ${colors.textSecondary};
        }
        .montar-treino-counter-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: #0a1525;
          color: ${colors.textPrimary};
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .montar-treino-counter-val {
          font-weight: 700;
          font-size: 0.9rem;
          min-width: 2.5rem;
          text-align: center;
        }
        .montar-treino-obs {
          width: 100%;
          border-radius: 8px;
          border: 1px solid ${colors.border};
          background: #0a1525;
          color: ${colors.textPrimary};
          padding: 8px 10px;
          font-size: 0.85rem;
          font-family: inherit;
        }
        .montar-treino-salvar {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          border-radius: 12px;
          font-weight: 700;
        }
      `}</style>
    </main>
  );
}

function CounterGroup({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="montar-treino-counter">
      <span className="montar-treino-counter-label">{label}</span>
      <button type="button" className="montar-treino-counter-btn" onClick={onMinus}>
        <Minus size={14} />
      </button>
      <span className="montar-treino-counter-val">{value}</span>
      <button type="button" className="montar-treino-counter-btn" onClick={onPlus}>
        <Plus size={14} />
      </button>
    </div>
  );
}
