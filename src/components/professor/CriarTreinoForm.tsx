"use client";

import { Plus } from "lucide-react";
import { useCriarTreino } from "@/hooks/useCriarTreino";
import { ExercicioFormCard } from "@/components/professor/ExercicioFormCard";
import { ExercisePickerModal } from "@/components/professor/ExercisePickerModal";

interface CriarTreinoFormProps {
  alunoId: string;
  onCancelar: () => void;
  onSucesso: () => void;
}

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
    pickerAberto,
    setPickerAberto,
    handleChange,
    adicionarDoCatalogo,
    removerExercicio,
    substituirCatalogo,
    handleExercicioChange,
    handleSubmit,
  } = useCriarTreino(alunoId, onSucesso);

  return (
    <section className="page-stack">
      <form
        className="form-grid form-grid--2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div>
          <label className="field-label" htmlFor="criar-treino-nome">
            Nome do treino
          </label>
          <input
            id="criar-treino-nome"
            className="input-field"
            value={form.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
          />
          {errors.nome ? <p className="field-error">{errors.nome}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="criar-treino-dia">
            Dia da semana
          </label>
          <select
            id="criar-treino-dia"
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

        <div className="field-span2 form-section-head">
          <h3 className="form-section-title">Exercícios</h3>
          <button
            type="button"
            className="btn-primary btn-compact"
            onClick={() => setPickerAberto(true)}
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>

        {errors.exercicios &&
        errors.exercicios[0]?.nome === "Adicione pelo menos um exercício" ? (
          <p className="field-span2 field-error" style={{ marginTop: "-4px" }}>
            Adicione pelo menos um exercício
          </p>
        ) : null}

        {form.exercicios.map((exercicio, index) => (
          <div key={exercicio.id} className="field-span2">
            <ExercicioFormCard
              exercicio={exercicio}
              index={index}
              errors={errors.exercicios?.[index]}
              onRemover={() => removerExercicio(exercicio.id)}
              onChange={(campo, valor) =>
                handleExercicioChange(exercicio.id, campo, valor)
              }
              onSubstituirCatalogo={substituirCatalogo}
            />
          </div>
        ))}

        {feedbackErro ? (
          <p className="field-span2 field-error" style={{ margin: 0 }}>
            {feedbackErro}
          </p>
        ) : null}

        <div className="field-span2 form-actions">
          <button type="button" onClick={onCancelar} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loadingSubmit}>
            {loadingSubmit ? "Salvando..." : "Salvar treino"}
          </button>
        </div>
      </form>

      <ExercisePickerModal
        open={pickerAberto}
        onFechar={() => setPickerAberto(false)}
        onSelecionar={(item) => {
          adicionarDoCatalogo(item);
          setPickerAberto(false);
        }}
      />
    </section>
  );
}
