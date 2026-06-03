import { useState } from "react";
import { ExercicioForm, TreinoTemplateForm, TreinoTemplateFormErrors } from "@/types";
import { criarTemplate } from "@/services/professorService";
import {
  exercicioFormFromCatalogo,
  exercicioFormParaPayload,
  exercicioFormValido,
} from "@/lib/form-exercicio";
import { ExercicioCatalogo } from "@/types";

interface UseCriarTemplateReturn {
  form: TreinoTemplateForm;
  errors: TreinoTemplateFormErrors;
  loadingSubmit: boolean;
  feedbackErro: string | null;
  pickerAberto: boolean;
  setPickerAberto: (v: boolean) => void;
  handleChange: (
    campo: keyof Omit<TreinoTemplateForm, "exercicios">,
    valor: string
  ) => void;
  adicionarDoCatalogo: (item: ExercicioCatalogo) => void;
  removerExercicio: (id: string) => void;
  substituirCatalogo: (id: string, exercicio: ExercicioForm) => void;
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

    if (!exercicioFormValido(exercicio)) {
      erro.nome = "Selecione um exercício do catálogo";
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

export function useCriarTemplate(onSucesso: () => void): UseCriarTemplateReturn {
  const [form, setForm] = useState<TreinoTemplateForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<TreinoTemplateFormErrors>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);
  const [pickerAberto, setPickerAberto] = useState(false);

  const handleChange = (
    campo: keyof Omit<TreinoTemplateForm, "exercicios">,
    valor: string
  ): void => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({ ...prev, [campo]: undefined, geral: undefined }));
  };

  const adicionarDoCatalogo = (item: ExercicioCatalogo): void => {
    setForm((prev) => ({
      ...prev,
      exercicios: [...prev.exercicios, exercicioFormFromCatalogo(item)],
    }));
    setErrors((prev) => ({ ...prev, exercicios: undefined, geral: undefined }));
  };

  const removerExercicio = (id: string): void => {
    setForm((prev) => ({
      ...prev,
      exercicios: prev.exercicios.filter((exercicio) => exercicio.id !== id),
    }));
  };

  const substituirCatalogo = (id: string, exercicio: ExercicioForm): void => {
    setForm((prev) => ({
      ...prev,
      exercicios: prev.exercicios.map((ex) => (ex.id === id ? exercicio : ex)),
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
        professorId: "",
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        exercicios: form.exercicios.map((exercicio) => {
          const payload = exercicioFormParaPayload(exercicio);
          return {
            id: exercicio.id,
            nome: payload.nome,
            series: payload.series,
            repeticoes: payload.repeticoes,
            observacao: payload.observacao,
            grupoMuscular: payload.grupoMuscular,
            exercicioCatalogoId: payload.exercicioCatalogoId,
          };
        }),
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
    pickerAberto,
    setPickerAberto,
    handleChange,
    adicionarDoCatalogo,
    removerExercicio,
    substituirCatalogo,
    handleExercicioChange,
    handleSubmit,
  };
}
