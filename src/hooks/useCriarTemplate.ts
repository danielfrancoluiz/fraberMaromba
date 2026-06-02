import { useState } from "react";
import { ExercicioForm, TreinoTemplateForm, TreinoTemplateFormErrors } from "@/types";
import { criarTemplate } from "@/services/professorService";
import { professorAtivo } from "@/mocks/professorMock";

interface UseCriarTemplateReturn {
  form: TreinoTemplateForm;
  errors: TreinoTemplateFormErrors;
  loadingSubmit: boolean;
  feedbackErro: string | null;
  handleChange: (
    campo: keyof Omit<TreinoTemplateForm, "exercicios">,
    valor: string
  ) => void;
  adicionarExercicio: () => void;
  removerExercicio: (id: string) => void;
  handleExercicioChange: (
    id: string,
    campo: keyof ExercicioForm,
    valor: string
  ) => void;
  handleSubmit: () => Promise<void>;
}

const FORM_INICIAL: TreinoTemplateForm = {
  nome: "",
  descricao: "",
  exercicios: [],
};

function validarFormulario(form: TreinoTemplateForm): TreinoTemplateFormErrors {
  const errors: TreinoTemplateFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = "Campo obrigatório";
  }

  if (form.exercicios.length === 0) {
    errors.geral = "Adicione pelo menos um exercício";
    return errors;
  }

  const errosExercicios = form.exercicios.map((exercicio) => {
    const erro: { nome?: string; series?: string; repeticoes?: string } = {};

    if (!exercicio.nome.trim()) {
      erro.nome = "Campo obrigatório";
    }

    const series = Number.parseInt(exercicio.series, 10);
    if (!exercicio.series.trim() || Number.isNaN(series) || series < 1 || series > 20) {
      erro.series = "Séries devem ser entre 1 e 20";
    }

    const repeticoes = Number.parseInt(exercicio.repeticoes, 10);
    if (
      !exercicio.repeticoes.trim() ||
      Number.isNaN(repeticoes) ||
      repeticoes < 1 ||
      repeticoes > 100
    ) {
      erro.repeticoes = "Repetições devem ser entre 1 e 100";
    }

    return erro;
  });

  if (errosExercicios.some((erro) => Object.keys(erro).length > 0)) {
    errors.exercicios = errosExercicios;
  }

  return errors;
}

export function useCriarTemplate(
  onSucesso: () => void
): UseCriarTemplateReturn {
  const [form, setForm] = useState<TreinoTemplateForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<TreinoTemplateFormErrors>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  const handleChange = (
    campo: keyof Omit<TreinoTemplateForm, "exercicios">,
    valor: string
  ): void => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({ ...prev, [campo]: undefined, geral: undefined }));
  };

  const adicionarExercicio = (): void => {
    const novoExercicio: ExercicioForm = {
      id: crypto.randomUUID(),
      nome: "",
      series: "",
      repeticoes: "",
      observacao: "",
      grupoMuscular: "",
    };

    setForm((prev) => ({
      ...prev,
      exercicios: [...prev.exercicios, novoExercicio],
    }));
    setErrors((prev) => ({ ...prev, exercicios: undefined, geral: undefined }));
  };

  const removerExercicio = (id: string): void => {
    setForm((prev) => ({
      ...prev,
      exercicios: prev.exercicios.filter((exercicio) => exercicio.id !== id),
    }));
  };

  const handleExercicioChange = (
    id: string,
    campo: keyof ExercicioForm,
    valor: string
  ): void => {
    setForm((prev) => ({
      ...prev,
      exercicios: prev.exercicios.map((exercicio) =>
        exercicio.id === id ? { ...exercicio, [campo]: valor } : exercicio
      ),
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    const erros = validarFormulario(form);
    if (Object.keys(erros).length > 0) {
      setErrors(erros);
      return;
    }

    setErrors({});
    setFeedbackErro(null);
    setLoadingSubmit(true);

    try {
      await criarTemplate({
        professorId: professorAtivo.id,
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        exercicios: form.exercicios.map((exercicio) => ({
          id: exercicio.id,
          nome: exercicio.nome.trim(),
          series: Number.parseInt(exercicio.series, 10),
          repeticoes: Number.parseInt(exercicio.repeticoes, 10),
          observacao: exercicio.observacao.trim() || undefined,
          grupoMuscular: exercicio.grupoMuscular.trim() || undefined,
        })),
      });

      onSucesso();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o template";
      setFeedbackErro(mensagem);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return {
    form,
    errors,
    loadingSubmit,
    feedbackErro,
    handleChange,
    adicionarExercicio,
    removerExercicio,
    handleExercicioChange,
    handleSubmit,
  };
}
