"use client";

import { useEffect, useMemo, useState } from "react";
import type { Exercicio, TreinoSessao } from "@/types";
import { iniciarSessao } from "@/services/sessaoService";
import { montarProgressoSeries } from "@/lib/treino-progresso";

function chaveProgresso(
  treinoId: string | undefined,
  exerciciosKey: string,
  refreshKey: number
): string | null {
  if (!treinoId || !exerciciosKey) return null;
  return `${treinoId}|${exerciciosKey}|${refreshKey}`;
}

export function useTreinoListaProgresso(
  treinoId: string | undefined,
  exercicios: Exercicio[],
  refreshKey = 0
) {
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [chaveResolvida, setChaveResolvida] = useState<string | null>(null);

  const exerciciosKey = useMemo(
    () =>
      exercicios.length > 0
        ? exercicios.map((e) => `${e.id}:${e.series}`).join("|")
        : "",
    [exercicios]
  );

  const chaveAtual = chaveProgresso(treinoId, exerciciosKey, refreshKey);
  const semDados = chaveAtual === null;
  const loading = !semDados && chaveResolvida !== chaveAtual;

  useEffect(() => {
    if (!chaveAtual || !treinoId) return;

    let cancelled = false;
    const chave = chaveAtual;

    void (async () => {
      try {
        const sessao: TreinoSessao = await iniciarSessao(treinoId);
        if (cancelled) return;
        setSessaoId(sessao.id);
        setCompletedSets(montarProgressoSeries(exercicios, sessao));
        setErro(null);
        setChaveResolvida(chave);
      } catch (error) {
        if (cancelled) return;
        setErro(
          error instanceof Error ? error.message : "Erro ao carregar progresso"
        );
        setCompletedSets({});
        setSessaoId(null);
        setChaveResolvida(chave);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chaveAtual, treinoId, exercicios]);

  return {
    completedSets: semDados ? {} : completedSets,
    sessaoId: semDados ? null : sessaoId,
    loading,
    erro: semDados ? null : erro,
  };
}
