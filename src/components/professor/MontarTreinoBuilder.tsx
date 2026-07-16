"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Dumbbell,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useMontarTreino } from "@/hooks/useMontarTreino";
import { ExercisePickerModal } from "@/components/professor/ExercisePickerModal";
import { SeriesModeControls } from "@/components/professor/SeriesModeControls";
import { OBJETIVOS_TREINO } from "@/lib/treino-objetivos";
import { PageTopBar } from "@/components/ui/PageTopBar";

interface MontarTreinoBuilderProps {
  treinoId?: string;
  alunoIdInicial?: string;
  alunoIdFixo?: boolean;
  titulo?: string;
  onCancelar: () => void;
  onSucesso: () => void;
}

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
    patchExercicio,
    handleSubmit,
  } = useMontarTreino({ treinoId, alunoIdInicial, onSucesso });

  const tituloPagina =
    titulo ?? (modoEdicao ? "Editar treino" : "Montar treino");

  if (loadingTreino) {
    return (
      <main className="page-main montar-treino-page">
        <p className="loading-center text-muted">Carregando treino...</p>
      </main>
    );
  }

  return (
    <main className="page-main montar-treino-page">
      <div className="page-container page-stack">
        <PageTopBar
          title={tituloPagina}
          subtitle={modoEdicao ? "Atualize o plano do aluno" : "Monte um plano personalizado"}
          onBack={onCancelar}
        />

        <form
          className="montar-treino-form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <section className="card">
            <div className="montar-treino-fields">
              <div>
                <label className="field-label" htmlFor="treino-nome">
                  Nome do treino
                </label>
                <input
                  id="treino-nome"
                  className="input-field"
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  placeholder="Ex: Treino A — Peito"
                />
                {errors.nome ? <p className="field-error">{errors.nome}</p> : null}
              </div>

              <div>
                <label className="field-label" htmlFor="treino-descricao">
                  Descrição
                </label>
                <textarea
                  id="treino-descricao"
                  className="input-field textarea-field"
                  value={form.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Descreva o treino..."
                  rows={2}
                  style={{ minHeight: "72px" }}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="treino-objetivo">
                  Objetivo / meta
                </label>
                <div className="select-wrap">
                  <select
                    id="treino-objetivo"
                    className="input-field"
                    value={form.objetivo}
                    onChange={(e) => handleChange("objetivo", e.target.value)}
                  >
                    {OBJETIVOS_TREINO.map((o) => (
                      <option key={o.value || "vazio"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-wrap-icon" aria-hidden />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="treino-aluno">
                  Aluno
                </label>
                <div className="select-wrap">
                  <select
                    id="treino-aluno"
                    className="input-field"
                    value={form.alunoId}
                    onChange={(e) => handleChange("alunoId", e.target.value)}
                    disabled={alunoIdFixo || loadingAlunos}
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
                  <ChevronDown size={18} className="select-wrap-icon" aria-hidden />
                </div>
                {errors.alunoId ? <p className="field-error">{errors.alunoId}</p> : null}
              </div>

              <div>
                <label className="field-label" htmlFor="treino-dia">
                  Dia da semana
                </label>
                <select
                  id="treino-dia"
                  className="input-field"
                  value={form.diaSemana}
                  onChange={(e) => handleChange("diaSemana", e.target.value)}
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
                {errors.diaSemana ? <p className="field-error">{errors.diaSemana}</p> : null}
              </div>
            </div>
          </section>

          <div className="montar-treino-exercicios-bar">
            <div>
              <h2 className="form-section-label">Exercícios</h2>
              <p className="text-muted montar-treino-hint">
                Adicione do catálogo e ajuste séries, repetições e descanso.
              </p>
            </div>
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
            <p className="field-error" style={{ margin: 0 }}>
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
                  <div className="montar-treino-ex-header">
                    <span className="montar-treino-ex-numero">{idx + 1}</span>
                    {exercicio.imagemUrl ? (
                      <img
                        src={exercicio.imagemUrl}
                        alt=""
                        className="montar-treino-thumb"
                        width={52}
                        height={52}
                      />
                    ) : (
                      <div
                        className="montar-treino-thumb montar-treino-thumb--empty"
                        title="Sem imagem no catálogo"
                      >
                        <Dumbbell size={22} />
                      </div>
                    )}
                    <div className="montar-treino-ex-info">
                      <p className="montar-treino-ex-nome">{exercicio.nome || "Exercício sem nome"}</p>
                      <p className="montar-treino-ex-sub text-muted">
                        {exercicio.imagemUrl ? "Do catálogo" : "Sem imagem no catálogo"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="chip chip--danger chip--icon"
                      onClick={() => removerExercicio(exercicio.id)}
                      aria-label="Remover exercício"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="montar-treino-reorder-bar">
                    <span className="field-label">Ordem na lista</span>
                    <div className="montar-treino-reorder-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-compact"
                        disabled={idx === 0}
                        onClick={() => moverExercicio(idx, "cima")}
                      >
                        <ArrowUp size={14} />
                        Subir
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-compact"
                        disabled={idx === form.exercicios.length - 1}
                        onClick={() => moverExercicio(idx, "baixo")}
                      >
                        <ArrowDown size={14} />
                        Descer
                      </button>
                    </div>
                  </div>

                  <SeriesModeControls
                    compact
                    exercicio={exercicio}
                    onPatch={(patch) => patchExercicio(exercicio.id, patch)}
                    afterToggle={
                      <div className="montar-treino-counter-grid">
                        <CounterGroup
                          label="Séries"
                          value={String(exercicio.series)}
                          onMinus={() => ajustarExercicio(exercicio.id, "series", -1)}
                          onPlus={() => ajustarExercicio(exercicio.id, "series", 1)}
                        />
                        {exercicio.modoSeries !== "decrescente" ? (
                          <CounterGroup
                            label="Repetições"
                            value={String(exercicio.repeticoes)}
                            onMinus={() =>
                              ajustarExercicio(exercicio.id, "repeticoes", -1)
                            }
                            onPlus={() =>
                              ajustarExercicio(exercicio.id, "repeticoes", 1)
                            }
                          />
                        ) : null}
                        <CounterGroup
                          label="Descanso"
                          value={`${exercicio.restSeconds}s`}
                          onMinus={() =>
                            ajustarExercicio(exercicio.id, "restSeconds", -5)
                          }
                          onPlus={() =>
                            ajustarExercicio(exercicio.id, "restSeconds", 5)
                          }
                        />
                      </div>
                    }
                  />

                  <div>
                    <label className="field-label" htmlFor={`obs-${exercicio.id}`}>
                      Observação (opcional)
                    </label>
                    <input
                      id={`obs-${exercicio.id}`}
                      type="text"
                      value={exercicio.observacao}
                      onChange={(e) =>
                        handleExercicioChange(exercicio.id, "observacao", e.target.value)
                      }
                      placeholder="Ex: pegada neutra, cadência lenta..."
                      className="input-field"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {feedbackErro ? (
            <p className="field-error" style={{ margin: 0 }}>
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
      </div>

      <ExercisePickerModal
        open={pickerAberto}
        onFechar={() => setPickerAberto(false)}
        onSelecionar={(item) => {
          adicionarDoCatalogo(item);
          setPickerAberto(false);
        }}
      />
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
    <div className="montar-treino-counter-card">
      <span className="montar-treino-counter-label">{label}</span>
      <div className="montar-treino-counter-controls">
        <button
          type="button"
          className="montar-treino-counter-btn"
          onClick={onMinus}
          aria-label={`Diminuir ${label.toLowerCase()}`}
        >
          <Minus size={14} />
        </button>
        <span className="montar-treino-counter-val">{value}</span>
        <button
          type="button"
          className="montar-treino-counter-btn"
          onClick={onPlus}
          aria-label={`Aumentar ${label.toLowerCase()}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
