import { useCallback, useEffect, useMemo, useState } from "react";
import { Exercicio, ExercicioSubstituto, Treino, TreinoSessao } from "@/types";
import { listarSubstitutos } from "@/services/alunoService";
import {
  finalizarSessao,
  iniciarSessao,
  marcarSerieSessao,
  substituirExercicioSessao,
} from "@/services/sessaoService";
import { labelGrupoMuscular } from "@/lib/grupos-musculares";
import { useTimer, useCountdown } from "@/hooks/useTimer";

export type WorkoutPhase = "exercise" | "rest" | "done";

function aplicarSubstituto(
  exercicio: Exercicio,
  substituto: ExercicioSubstituto
): Exercicio {
  return {
    ...exercicio,
    nome: substituto.nome,
    exercicioCatalogoId: substituto.id,
    grupoMuscular: substituto.grupoMuscular,
    descricao: substituto.descricao ?? exercicio.descricao,
    equipamento: substituto.equipamento ?? exercicio.equipamento,
    dificuldade: substituto.dificuldade ?? exercicio.dificuldade,
    imagemUrl: substituto.imagemUrl ?? substituto.gifUrl,
    gifUrl: substituto.gifUrl ?? substituto.imagemUrl,
  };
}

function catalogoParaSubstituto(
  cat: NonNullable<TreinoSessao["catalogoPorId"]>[string]
): ExercicioSubstituto {
  return {
    id: cat.id,
    nome: cat.nome,
    grupoMuscular: labelGrupoMuscular(cat.grupoMuscular) || cat.grupoMuscular,
    descricao: cat.descricao ?? undefined,
    equipamento: cat.equipamento ?? undefined,
    dificuldade: cat.dificuldade ?? undefined,
    imagemUrl: cat.imagemUrl ?? cat.gifUrl ?? undefined,
    gifUrl: cat.gifUrl ?? undefined,
  };
}

function hydrateFromSessao(
  sessao: TreinoSessao,
  exercicios: Exercicio[]
): {
  completedSets: Record<string, boolean[]>;
  substituicoes: Record<string, ExercicioSubstituto>;
  exIdx: number;
  setIdx: number;
} {
  const completedSets: Record<string, boolean[]> = {};

  for (const ex of exercicios) {
    completedSets[ex.id] = Array<boolean>(ex.series).fill(false);
  }

  for (const row of sessao.series) {
    const arr = completedSets[row.exercicioId];
    if (arr && row.concluida) {
      arr[row.numeroSerie - 1] = true;
    }
  }

  const substituicoes: Record<string, ExercicioSubstituto> = {};
  if (sessao.catalogoPorId) {
    for (const ex of exercicios) {
      const row = sessao.series.find(
        (s) => s.exercicioId === ex.id && s.substitutoCatalogoId
      );
      if (row?.substitutoCatalogoId && sessao.catalogoPorId[row.substitutoCatalogoId]) {
        substituicoes[ex.id] = catalogoParaSubstituto(
          sessao.catalogoPorId[row.substitutoCatalogoId]
        );
      }
    }
  }

  for (let i = 0; i < exercicios.length; i++) {
    const ex = exercicios[i];
    const arr = completedSets[ex.id] ?? [];
    for (let j = 0; j < ex.series; j++) {
      if (!arr[j]) {
        return { completedSets, substituicoes, exIdx: i, setIdx: j };
      }
    }
  }

  const last = exercicios.length - 1;
  return {
    completedSets,
    substituicoes,
    exIdx: Math.max(0, last),
    setIdx: Math.max(0, (exercicios[last]?.series ?? 1) - 1),
  };
}

export function useWorkoutExecution(
  treino: Treino | null,
  _alunoId: string,
  onTreinoConcluido?: () => void
) {
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [sessaoLoading, setSessaoLoading] = useState(true);
  const [sessaoErro, setSessaoErro] = useState<string | null>(null);
  const [substituicoes, setSubstituicoes] = useState<
    Record<string, ExercicioSubstituto>
  >({});
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState<WorkoutPhase>("exercise");
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(
    {}
  );
  const [showSubModal, setShowSubModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [substitutos, setSubstitutos] = useState<ExercicioSubstituto[]>([]);
  const [loadingSubstitutos, setLoadingSubstitutos] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const sessionTimer = useTimer(0, false);

  const exercicios = useMemo(() => {
    if (!treino) return [];
    return treino.exercicios.map((ex) => {
      const sub = substituicoes[ex.id];
      return sub ? aplicarSubstituto(ex, sub) : ex;
    });
  }, [treino, substituicoes]);

  const totalSeries = useMemo(
    () => exercicios.reduce((acc, ex) => acc + ex.series, 0),
    [exercicios]
  );

  const seriesConcluidas = useMemo(
    () =>
      Object.values(completedSets)
        .flat()
        .filter(Boolean).length,
    [completedSets]
  );

  const progressoPct =
    totalSeries > 0 ? Math.round((seriesConcluidas / totalSeries) * 100) : 0;

  const exercicioAtual = exercicios[exIdx];
  const proximoExercicio =
    exIdx < exercicios.length - 1 ? exercicios[exIdx + 1] : null;

  useEffect(() => {
    if (!treino) {
      setSessaoLoading(false);
      return;
    }

    let ativo = true;

    const iniciar = async (): Promise<void> => {
      setSessaoLoading(true);
      setSessaoErro(null);
      try {
        const sessao = await iniciarSessao(treino.id);
        if (!ativo) return;

        setSessaoId(sessao.id);
        const hydrated = hydrateFromSessao(sessao, treino.exercicios);
        setCompletedSets(hydrated.completedSets);
        setSubstituicoes(hydrated.substituicoes);
        setExIdx(hydrated.exIdx);
        setSetIdx(hydrated.setIdx);

        if (sessao.status === "concluido") {
          setPhase("done");
          setShowDoneModal(true);
        } else {
          sessionTimer.start();
        }
      } catch (error) {
        if (ativo) {
          setSessaoErro(
            error instanceof Error ? error.message : "Erro ao iniciar sessão"
          );
        }
      } finally {
        if (ativo) setSessaoLoading(false);
      }
    };

    void iniciar();

    return () => {
      ativo = false;
    };
  }, [treino?.id]);

  const finalizarTreino = useCallback(async () => {
    if (!sessaoId) return;
    setSyncing(true);
    try {
      await finalizarSessao(sessaoId, sessionTimer.seconds);
      sessionTimer.pause();
      setPhase("done");
      setShowDoneModal(true);
      onTreinoConcluido?.();
    } catch {
      /* mantém modal local se API falhar */
      sessionTimer.pause();
      setPhase("done");
      setShowDoneModal(true);
    } finally {
      setSyncing(false);
    }
  }, [sessaoId, sessionTimer, onTreinoConcluido]);

  const avancarAposDescanso = useCallback(() => {
    if (!exercicioAtual) return;

    const isUltimaSerie = setIdx >= exercicioAtual.series - 1;

    if (!isUltimaSerie) {
      setSetIdx((s) => s + 1);
      setPhase("exercise");
      return;
    }

    if (exIdx < exercicios.length - 1) {
      setExIdx((i) => i + 1);
      setSetIdx(0);
      setPhase("exercise");
      return;
    }

    void finalizarTreino();
  }, [exercicioAtual, setIdx, exIdx, exercicios.length, finalizarTreino]);

  const countdown = useCountdown(avancarAposDescanso);

  useEffect(() => {
    if (!showSubModal || !exercicioAtual) {
      setSubstitutos([]);
      return;
    }

    let ativo = true;

    const carregar = async (): Promise<void> => {
      setLoadingSubstitutos(true);
      try {
        const lista = await listarSubstitutos(
          exercicioAtual.grupoMuscular ?? "Outros",
          exercicioAtual.exercicioCatalogoId
        );
        if (ativo) setSubstitutos(lista);
      } catch {
        if (ativo) setSubstitutos([]);
      } finally {
        if (ativo) setLoadingSubstitutos(false);
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [showSubModal, exercicioAtual]);

  const marcarSerieConcluida = useCallback(() => {
    if (!exercicioAtual || !sessaoId) return;

    const key = exercicioAtual.id;
    const total = exercicioAtual.series;
    const numeroSerie = setIdx + 1;

    setCompletedSets((cs) => {
      const prev = cs[key] ?? Array<boolean>(total).fill(false);
      const updated = [...prev];
      updated[setIdx] = true;
      return { ...cs, [key]: updated };
    });

    void marcarSerieSessao(sessaoId, key, numeroSerie).catch(() => {});

    const descanso = exercicioAtual.restSeconds ?? 60;
    const isUltimaSerie = setIdx >= total - 1;
    const isUltimoExercicio = exIdx >= exercicios.length - 1;

    if (isUltimaSerie && isUltimoExercicio) {
      void finalizarTreino();
      return;
    }

    setPhase("rest");
    countdown.reset(descanso);
    countdown.start(descanso);
  }, [
    exercicioAtual,
    sessaoId,
    setIdx,
    exIdx,
    exercicios.length,
    countdown,
    finalizarTreino,
  ]);

  const pularDescanso = useCallback(() => {
    countdown.stop();
    avancarAposDescanso();
  }, [countdown, avancarAposDescanso]);

  const substituirExercicio = useCallback(
    (substituto: ExercicioSubstituto) => {
      if (!treino || !sessaoId) return;
      const exercicioId = treino.exercicios[exIdx]?.id;
      if (!exercicioId) return;
      setSubstituicoes((s) => ({ ...s, [exercicioId]: substituto }));
      setShowSubModal(false);
      void substituirExercicioSessao(sessaoId, exercicioId, substituto.id).catch(
        () => {}
      );
    },
    [exercicioAtual, sessaoId, treino, exIdx]
  );

  const fecharTreinoConcluido = useCallback(() => {
    setShowDoneModal(false);
  }, []);

  return {
    exercicios,
    exercicioAtual,
    proximoExercicio,
    exIdx,
    setIdx,
    phase,
    completedSets,
    progressoPct,
    seriesConcluidas,
    totalSeries,
    sessionSeconds: sessionTimer.seconds,
    restSeconds: countdown.seconds,
    marcarSerieConcluida,
    pularDescanso,
    showSubModal,
    setShowSubModal,
    showDoneModal,
    fecharTreinoConcluido,
    substitutos,
    loadingSubstitutos,
    substituirExercicio,
    sessaoLoading,
    sessaoErro,
    syncing,
  };
}
