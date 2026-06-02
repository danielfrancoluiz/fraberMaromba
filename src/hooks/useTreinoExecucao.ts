import { useCallback, useEffect, useRef, useState } from "react";
import { ExercicioSubstituto, Treino } from "@/types";
import {
  buscarProgresso,
  limparProgresso as limparProgressoService,
  listarSubstitutos,
  salvarProgresso,
} from "@/services/alunoService";

interface UseTreinoExecucaoReturn {
  exerciciosConcluidos: string[];
  timerSegundos: number;
  timerAtivo: boolean;
  timerCustom: number;
  setTimerCustom: (v: number) => void;
  iniciarTimer: () => void;
  pausarTimer: () => void;
  resetarTimer: () => void;
  marcarConcluido: (exercicioId: string) => void;
  desmarcarConcluido: (exercicioId: string) => void;
  todosConcluidos: boolean;
  limparProgresso: () => void;
  exercicioSubstituindo: string | null;
  setExercicioSubstituindo: (id: string | null) => void;
  substitutos: ExercicioSubstituto[];
  loadingSubstitutos: boolean;
  substituirExercicio: (exercicioId: string, substituto: ExercicioSubstituto) => void;
}

export function useTreinoExecucao(
  treino: Treino | null,
  alunoId: string
): UseTreinoExecucaoReturn {
  const [treinoLocal, setTreinoLocal] = useState<Treino | null>(treino);
  const [exerciciosConcluidos, setExerciciosConcluidos] = useState<string[]>([]);
  const [timerCustom, setTimerCustom] = useState(60);
  const [timerSegundos, setTimerSegundos] = useState(60);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [exercicioSubstituindo, setExercicioSubstituindo] = useState<string | null>(
    null
  );
  const [substitutos, setSubstitutos] = useState<ExercicioSubstituto[]>([]);
  const [loadingSubstitutos, setLoadingSubstitutos] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todosConcluidos =
    treinoLocal !== null &&
    treinoLocal.exercicios.length > 0 &&
    exerciciosConcluidos.length === treinoLocal.exercicios.length;

  const pararTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerAtivo(false);
  }, []);

  const persistirProgresso = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!treinoLocal) return;

      await salvarProgresso({
        treinoId: treinoLocal.id,
        alunoId,
        exerciciosConcluidos: ids,
        dataUltimaAtualizacao: new Date().toISOString(),
      });
    },
    [treinoLocal, alunoId]
  );

  const limparProgresso = useCallback((): void => {
    if (!treinoLocal) return;

    void limparProgressoService(treinoLocal.id, alunoId).then(() => {
      setExerciciosConcluidos([]);
    });
  }, [treinoLocal, alunoId]);

  useEffect(() => {
    setTreinoLocal(treino);
  }, [treino]);

  useEffect(() => {
    let ativo = true;

    const carregarProgresso = async (): Promise<void> => {
      if (!treino) {
        setExerciciosConcluidos([]);
        return;
      }

      try {
        const progresso = await buscarProgresso(treino.id, alunoId);
        if (ativo) {
          setExerciciosConcluidos(progresso?.exerciciosConcluidos ?? []);
        }
      } catch {
        if (ativo) {
          setExerciciosConcluidos([]);
        }
      }
    };

    void carregarProgresso();

    return () => {
      ativo = false;
    };
  }, [treino, alunoId]);

  useEffect(() => {
    if (!todosConcluidos || !treinoLocal) return;

    void limparProgressoService(treinoLocal.id, alunoId).then(() => {
      setExerciciosConcluidos([]);
    });
  }, [todosConcluidos, treinoLocal, alunoId]);

  useEffect(() => {
    if (!exercicioSubstituindo || !treinoLocal) {
      setSubstitutos([]);
      return;
    }

    const exercicio = treinoLocal.exercicios.find(
      (item) => item.id === exercicioSubstituindo
    );
    if (!exercicio) {
      setSubstitutos([]);
      return;
    }

    let ativo = true;

    const carregarSubstitutos = async (): Promise<void> => {
      setLoadingSubstitutos(true);
      try {
        const lista = await listarSubstitutos(exercicio.grupoMuscular ?? "Outros");
        if (ativo) setSubstitutos(lista);
      } catch {
        if (ativo) setSubstitutos([]);
      } finally {
        if (ativo) setLoadingSubstitutos(false);
      }
    };

    void carregarSubstitutos();

    return () => {
      ativo = false;
    };
  }, [exercicioSubstituindo, treinoLocal]);

  useEffect(() => {
    return () => {
      pararTimer();
    };
  }, [pararTimer]);

  const iniciarTimer = (): void => {
    if (timerAtivo || timerSegundos <= 0) return;

    setTimerAtivo(true);
    intervalRef.current = setInterval(() => {
      setTimerSegundos((prev) => {
        if (prev <= 1) {
          pararTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pausarTimer = (): void => {
    pararTimer();
  };

  const resetarTimer = (): void => {
    pararTimer();
    setTimerSegundos(timerCustom);
  };

  const marcarConcluido = (exercicioId: string): void => {
    setExerciciosConcluidos((prev) => {
      if (prev.includes(exercicioId)) return prev;
      const atualizado = [...prev, exercicioId];
      void persistirProgresso(atualizado);
      return atualizado;
    });
  };

  const desmarcarConcluido = (exercicioId: string): void => {
    setExerciciosConcluidos((prev) => {
      const atualizado = prev.filter((id) => id !== exercicioId);
      void persistirProgresso(atualizado);
      return atualizado;
    });
  };

  const substituirExercicio = (
    exercicioId: string,
    substituto: ExercicioSubstituto
  ): void => {
    setTreinoLocal((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exercicios: prev.exercicios.map((exercicio) =>
          exercicio.id === exercicioId
            ? {
                ...exercicio,
                nome: substituto.nome,
                grupoMuscular: substituto.grupoMuscular,
                observacao: substituto.descricao ?? exercicio.observacao,
              }
            : exercicio
        ),
      };
    });
    setExercicioSubstituindo(null);
  };

  return {
    exerciciosConcluidos,
    timerSegundos,
    timerAtivo,
    timerCustom,
    setTimerCustom,
    iniciarTimer,
    pausarTimer,
    resetarTimer,
    marcarConcluido,
    desmarcarConcluido,
    todosConcluidos,
    limparProgresso,
    exercicioSubstituindo,
    setExercicioSubstituindo,
    substitutos,
    loadingSubstitutos,
    substituirExercicio,
  };
}
