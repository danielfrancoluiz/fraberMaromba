"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { Exercicio, ExercicioForm, TreinoTemplate } from "@/types";
import { ExercicioFormCard } from "@/components/professor/ExercicioFormCard";
import { ExercisePickerModal } from "@/components/professor/ExercisePickerModal";
import {
  exercicioFormFromCatalogo,
  exercicioFormFromExercicio,
  exercicioFormParaPayload,
  exercicioFormValido,
} from "@/lib/form-exercicio";

interface EditarTemplateModalProps {
  template: TreinoTemplate;
  onFechar: () => void;
  onSalvar: (dados: {
    nome: string;
    descricao: string;
    exercicios: Exercicio[];
  }) => Promise<void>;
}

export function EditarTemplateModal({
  template,
  onFechar,
  onSalvar,
}: EditarTemplateModalProps) {
  const [nome, setNome] = useState(template.nome);
  const [descricao, setDescricao] = useState(template.descricao ?? "");
  const [exercicios, setExercicios] = useState<ExercicioForm[]>(() =>
    template.exercicios.map(exercicioFormFromExercicio)
  );
  const [pickerAberto, setPickerAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }

    if (exercicios.length === 0) {
      setErro("Adicione pelo menos um exercício");
      return;
    }

    const invalido = exercicios.find((ex) => !exercicioFormValido(ex));
    if (invalido) {
      setErro("Selecione um exercício do catálogo em cada bloco");
      return;
    }

    setLoading(true);
    setErro(null);
    try {
      await onSalvar({
        nome: nome.trim(),
        descricao: descricao.trim(),
        exercicios: exercicios.map((exercicio) => {
          const payload = exercicioFormParaPayload(exercicio);
          return {
            id: exercicio.id,
            nome: payload.nome,
            series: payload.series,
            repeticoes: payload.repeticoes,
            repeticoesPorSerie: payload.repeticoesPorSerie,
            observacao: payload.observacao,
            grupoMuscular: payload.grupoMuscular,
            exercicioCatalogoId: payload.exercicioCatalogoId,
          };
        }),
      });
      onFechar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  function handleExercicioChange(
    id: string,
    campo: keyof ExercicioForm,
    valor: string
  ) {
    setExercicios((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [campo]: valor } : ex))
    );
  }

  function patchExercicio(id: string, patch: Partial<ExercicioForm>) {
    setExercicios((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex))
    );
  }

  function substituirCatalogo(id: string, exercicio: ExercicioForm) {
    setExercicios((prev) => prev.map((ex) => (ex.id === id ? exercicio : ex)));
  }

  function removerExercicio(id: string) {
    setExercicios((prev) => prev.filter((ex) => ex.id !== id));
  }

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        className="modal-overlay"
        onClick={onFechar}
      >
        <form
          className="card modal-form-editar"
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => void handleSubmit(e)}
        >
          <div className="modal-form-header">
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Editar template</h2>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar"
              className="modal-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          <div className="page-stack">
            <div>
              <label className="field-label">Nome</label>
              <input
                className="input-field"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Descrição</label>
              <input
                className="input-field"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div>
              <div className="form-section-head" style={{ marginBottom: "8px" }}>
                <p className="form-section-title">
                  Exercícios ({exercicios.length})
                </p>
                <button
                  type="button"
                  className="btn-primary btn-compact"
                  onClick={() => setPickerAberto(true)}
                >
                  + Adicionar
                </button>
              </div>
              <p className="text-muted" style={{ margin: "0 0 8px", fontSize: "0.8rem" }}>
                Escolha do catálogo; treinos antigos só com nome continuam válidos.
              </p>
              <div className="modal-exercicios-lista">
                {exercicios.map((exercicio, index) => (
                  <ExercicioFormCard
                    key={exercicio.id}
                    exercicio={exercicio}
                    index={index}
                    onRemover={() => removerExercicio(exercicio.id)}
                    onChange={(campo, valor) =>
                      handleExercicioChange(exercicio.id, campo, valor)
                    }
                    onPatch={(patch) => patchExercicio(exercicio.id, patch)}
                    onSubstituirCatalogo={substituirCatalogo}
                  />
                ))}
              </div>
            </div>

            {erro ? (
              <p className="field-error" style={{ margin: 0 }}>
                {erro}
              </p>
            ) : null}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      <ExercisePickerModal
        open={pickerAberto}
        onFechar={() => setPickerAberto(false)}
        onSelecionar={(item) => {
          setExercicios((prev) => [...prev, exercicioFormFromCatalogo(item)]);
          setPickerAberto(false);
        }}
      />
    </ModalPortal>
  );
}
