import { useState } from "react";
import { ExercicioForm, TreinoForm, TreinoFormErrors } from "@/types";
import { criarTreino } from "@/services/professorService";
import { professorAtivo } from "@/mocks/professorMock";

interface UseCriarTreinoReturn {
  form: TreinoForm;
  errors: TreinoFormErrors;
  loadingSubmit: boolean;
  feedbackErro: string | null;
  handleChange: (campo: keyof Omit<TreinoForm, "exercicios">, valor: string) => void;
  adicionarExercicio: () => void;
  removerExercicio: (id: string) => void;
  handleExercicioChange: (
    id: string,
    campo: keyof ExercicioForm,
    valor: string
  ) => void;
  handleSubmit: () => Promise<void>;
}

const FORM_INICIAL: TreinoForm = {
  nome: "",
  diaSemana: "",
  exercicios: [],
};

function validarTreino(form: TreinoForm): TreinoFormErrors {
  const errors: TreinoFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = "Campo obrigatório";
  }

  if (!form.diaSemana) {
    errors.diaSemana = "Campo obrigatório";
  }

  if (form.exercicios.length === 0) {
    errors.exercicios = [{ nome: "Adicione pelo menos um exercício" }];
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

export function useCriarTreino(
  alunoId: string,
  onSucesso: () => void
): UseCriarTreinoReturn {
  const [form, setForm] = useState<TreinoForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<TreinoFormErrors>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  const handleChange = (
    campo: keyof Omit<TreinoForm, "exercicios">,
    valor: string
  ): void => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({ ...prev, [campo]: undefined }));
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
    setErrors((prev) => ({ ...prev, exercicios: undefined }));
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

    setErrors((prev) => {
      if (!prev.exercicios) return prev;
      const index = form.exercicios.findIndex((item) => item.id === id);
      if (index < 0) return prev;

      const novosErros = [...prev.exercicios];
      const erroAtual = { ...(novosErros[index] ?? {}) };
      if (campo === "nome" || campo === "series" || campo === "repeticoes") {
        erroAtual[campo] = undefined;
      }
      novosErros[index] = erroAtual;
      return { ...prev, exercicios: novosErros };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const erros = validarTreino(form);
    if (Object.keys(erros).length > 0) {
      setErrors(erros);
      return;
    }

    if (!form.diaSemana) return;

    setErrors({});
    setFeedbackErro(null);
    setLoadingSubmit(true);

    try {
      await criarTreino({
        alunoId,
        professorId: professorAtivo.id,
        nome: form.nome.trim(),
        diaSemana: form.diaSemana,
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
          : "Não foi possível criar o treino";
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
