import { useCallback, useEffect, useState } from "react";
import { ExercicioCatalogo, ExercicioForm, TreinoForm, TreinoFormErrors } from "@/types";
import {
  buscarTreino,
  criarTreino,
  atualizarTreino,
  listarAlunos,
} from "@/services/professorService";
import { Aluno } from "@/types";
import {
  exercicioFormFromCatalogo,
  exercicioFormFromExercicio,
  exercicioFormParaPayload,
  exercicioFormValido,
} from "@/lib/form-exercicio";

interface UseMontarTreinoOptions {
  treinoId?: string;
  alunoIdInicial?: string;
  onSucesso: () => void;
}

interface UseMontarTreinoReturn {
  form: TreinoForm & { alunoId: string };
  errors: TreinoFormErrors & { alunoId?: string };
  alunos: Aluno[];
  loadingAlunos: boolean;
  loadingTreino: boolean;
  loadingSubmit: boolean;
  feedbackErro: string | null;
  modoEdicao: boolean;
  pickerAberto: boolean;
  setPickerAberto: (v: boolean) => void;
  handleChange: (
    campo: keyof Omit<TreinoForm & { alunoId: string }, "exercicios">,
    valor: string
  ) => void;
  adicionarDoCatalogo: (item: ExercicioCatalogo) => void;
  removerExercicio: (id: string) => void;
  moverExercicio: (index: number, direcao: "cima" | "baixo") => void;
  ajustarExercicio: (
    id: string,
    campo: "series" | "repeticoes" | "restSeconds",
    delta: number
  ) => void;
  handleExercicioChange: (
    id: string,
    campo: keyof ExercicioForm,
    valor: string
  ) => void;
  handleSubmit: () => Promise<void>;
}

const FORM_INICIAL = {
  nome: "",
  descricao: "",
  objetivo: "",
  alunoId: "",
  diaSemana: "" as TreinoForm["diaSemana"] | "",
  exercicios: [] as ExercicioForm[],
};

function validarMontar(
  form: TreinoForm & { alunoId: string }
): TreinoFormErrors & { alunoId?: string } {
  const errors: TreinoFormErrors & { alunoId?: string } = {};

  if (!form.alunoId) errors.alunoId = "Selecione um aluno";
  if (!form.nome.trim()) errors.nome = "Campo obrigatório";
  if (!form.diaSemana) errors.diaSemana = "Campo obrigatório";

  if (form.exercicios.length === 0) {
    errors.exercicios = [{ nome: "Adicione pelo menos um exercício" }];
    return errors;
  }

  const errosExercicios = form.exercicios.map((exercicio) => {
    const erro: {
      nome?: string;
      series?: string;
      repeticoes?: string;
      restSeconds?: string;
    } = {};

    if (!exercicioFormValido(exercicio)) {
      erro.nome = "Selecione um exercício do catálogo";
    }

    const series = Number.parseInt(exercicio.series, 10);
    if (!exercicio.series.trim() || Number.isNaN(series) || series < 1 || series > 20) {
      erro.series = "1–20";
    }

    const repeticoes = Number.parseInt(exercicio.repeticoes, 10);
    if (
      !exercicio.repeticoes.trim() ||
      Number.isNaN(repeticoes) ||
      repeticoes < 1 ||
      repeticoes > 100
    ) {
      erro.repeticoes = "1–100";
    }

    const rest = Number.parseInt(exercicio.restSeconds, 10);
    if (!exercicio.restSeconds.trim() || Number.isNaN(rest) || rest < 0 || rest > 600) {
      erro.restSeconds = "0–600s";
    }

    return erro;
  });

  if (errosExercicios.some((erro) => Object.keys(erro).length > 0)) {
    errors.exercicios = errosExercicios;
  }

  return errors;
}

export function useMontarTreino({
  treinoId,
  alunoIdInicial,
  onSucesso,
}: UseMontarTreinoOptions): UseMontarTreinoReturn {
  const [form, setForm] = useState({ ...FORM_INICIAL, alunoId: alunoIdInicial ?? "" });
  const [errors, setErrors] = useState<TreinoFormErrors & { alunoId?: string }>({});
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [loadingTreino, setLoadingTreino] = useState(Boolean(treinoId));
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);
  const [pickerAberto, setPickerAberto] = useState(false);

  const modoEdicao = Boolean(treinoId);

  useEffect(() => {
    let ativo = true;
    setLoadingAlunos(true);
    void listarAlunos("")
      .then((lista) => {
        if (ativo) setAlunos(lista);
      })
      .catch(() => {
        if (ativo) setAlunos([]);
      })
      .finally(() => {
        if (ativo) setLoadingAlunos(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!treinoId) {
      setLoadingTreino(false);
      return;
    }

    let ativo = true;
    setLoadingTreino(true);
    void buscarTreino(treinoId)
      .then((treino) => {
        if (!ativo || !treino) return;
        setForm({
          nome: treino.nome,
          descricao: treino.descricao ?? "",
          objetivo: treino.objetivo ?? "",
          alunoId: treino.alunoId,
          diaSemana: treino.diaSemana,
          exercicios: treino.exercicios.map(exercicioFormFromExercicio),
        });
      })
      .catch(() => {
        if (ativo) setFeedbackErro("Não foi possível carregar o treino.");
      })
      .finally(() => {
        if (ativo) setLoadingTreino(false);
      });

    return () => {
      ativo = false;
    };
  }, [treinoId]);

  useEffect(() => {
    if (alunoIdInicial && !treinoId) {
      setForm((prev) => ({ ...prev, alunoId: alunoIdInicial }));
    }
  }, [alunoIdInicial, treinoId]);

  const handleChange = useCallback(
    (campo: keyof Omit<TreinoForm & { alunoId: string }, "exercicios">, valor: string) => {
      setForm((prev) => ({ ...prev, [campo]: valor }));
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    },
    []
  );

  const adicionarDoCatalogo = useCallback((item: ExercicioCatalogo) => {
    setForm((prev) => ({
      ...prev,
      exercicios: [...prev.exercicios, exercicioFormFromCatalogo(item)],
    }));
    setErrors((prev) => ({ ...prev, exercicios: undefined }));
  }, []);

  const removerExercicio = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      exercicios: prev.exercicios.filter((ex) => ex.id !== id),
    }));
  }, []);

  const moverExercicio = useCallback((index: number, direcao: "cima" | "baixo") => {
    setForm((prev) => {
      const lista = [...prev.exercicios];
      const alvo = direcao === "cima" ? index - 1 : index + 1;
      if (alvo < 0 || alvo >= lista.length) return prev;
      [lista[index], lista[alvo]] = [lista[alvo], lista[index]];
      return { ...prev, exercicios: lista };
    });
  }, []);

  const ajustarExercicio = useCallback(
    (id: string, campo: "series" | "repeticoes" | "restSeconds", delta: number) => {
      setForm((prev) => ({
        ...prev,
        exercicios: prev.exercicios.map((ex) => {
          if (ex.id !== id) return ex;
          const atual = Number.parseInt(ex[campo], 10) || 0;
          const min = campo === "restSeconds" ? 0 : 1;
          const max = campo === "restSeconds" ? 600 : campo === "series" ? 20 : 100;
          const novo = Math.min(max, Math.max(min, atual + delta));
          return { ...ex, [campo]: String(novo) };
        }),
      }));
    },
    []
  );

  const handleExercicioChange = useCallback(
    (id: string, campo: keyof ExercicioForm, valor: string) => {
      setForm((prev) => ({
        ...prev,
        exercicios: prev.exercicios.map((ex) =>
          ex.id === id ? { ...ex, [campo]: valor } : ex
        ),
      }));
    },
    []
  );

  const handleSubmit = async (): Promise<void> => {
    const erros = validarMontar(form);
    if (Object.keys(erros).length > 0) {
      setErrors(erros);
      return;
    }

    if (!form.diaSemana) return;

    setErrors({});
    setFeedbackErro(null);
    setLoadingSubmit(true);

    const exerciciosPayload = form.exercicios.map((ex) => {
      const p = exercicioFormParaPayload(ex);
      return {
        id: ex.id,
        nome: p.nome,
        series: p.series,
        repeticoes: p.repeticoes,
        observacao: p.observacao,
        grupoMuscular: p.grupoMuscular,
        exercicioCatalogoId: p.exercicioCatalogoId,
        restSeconds: p.restSeconds,
      };
    });

    try {
      if (modoEdicao && treinoId) {
        await atualizarTreino(treinoId, {
          alunoId: form.alunoId,
          nome: form.nome.trim(),
          descricao: form.descricao.trim(),
          objetivo: form.objetivo.trim(),
          diaSemana: form.diaSemana,
          exercicios: exerciciosPayload,
        });
      } else {
        await criarTreino({
          alunoId: form.alunoId,
          professorId: "",
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || undefined,
          objetivo: form.objetivo.trim() || undefined,
          diaSemana: form.diaSemana,
          exercicios: exerciciosPayload,
        });
      }
      onSucesso();
    } catch (error) {
      setFeedbackErro(
        error instanceof Error ? error.message : "Não foi possível salvar o treino"
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  return {
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
  };
}
