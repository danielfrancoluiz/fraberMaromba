"use client";

import { Plus } from "lucide-react";
import { useCriarTemplate } from "@/hooks/useCriarTemplate";
import { ExercicioFormCard } from "@/components/professor/ExercicioFormCard";
import { ExercisePickerModal } from "@/components/professor/ExercisePickerModal";
import { PageTopBar } from "@/components/ui/PageTopBar";

interface CriarTemplateFormProps {
  onCancelar: () => void;
  onSucesso: () => void;
}

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
    patchExercicio,
    handleSubmit,
  } = useCriarTemplate(onSucesso);

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Novo template"
          subtitle="Crie um modelo reutilizável"
          onBack={onCancelar}
        />

        <form
          className="form-grid form-grid--2"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="field-span2">
            <label className="field-label" htmlFor="template-nome">
              Nome do template
            </label>
            <input
              id="template-nome"
              className="input-field"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
            />
            {errors.nome ? <p className="field-error">{errors.nome}</p> : null}
          </div>

          <div className="field-span2">
            <label className="field-label" htmlFor="template-descricao">
              Descrição (opcional)
            </label>
            <textarea
              id="template-descricao"
              rows={3}
              className="input-field textarea-field"
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
            />
            {errors.descricao ? <p className="field-error">{errors.descricao}</p> : null}
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
                onPatch={(patch) => patchExercicio(exercicio.id, patch)}
                onSubstituirCatalogo={substituirCatalogo}
              />
            </div>
          ))}

          {errors.geral ? (
            <p className="field-span2 field-error" style={{ margin: 0 }}>
              {errors.geral}
            </p>
          ) : null}
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
              {loadingSubmit ? "Salvando..." : "Salvar template"}
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
    </main>
  );
}
