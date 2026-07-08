"use client";

import { useCallback, useEffect, useState } from "react";
import type { Exercicio, TreinoSessao } from "@/types";
import { iniciarSessao } from "@/services/sessaoService";
import { montarProgressoSeries } from "@/lib/treino-progresso";

export function useTreinoListaProgresso(
  treinoId: string | undefined,
  exercicios: Exercicio[],
  refreshKey = 0
) {
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!treinoId || exercicios.length === 0) {
      setCompletedSets({});
      setSessaoId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const sessao: TreinoSessao = await iniciarSessao(treinoId);
      setSessaoId(sessao.id);
      setCompletedSets(montarProgressoSeries(exercicios, sessao));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar progresso");
      setCompletedSets({});
      setSessaoId(null);
    } finally {
      setLoading(false);
    }
  }, [treinoId, exercicios]);

  useEffect(() => {
    void carregar();
  }, [carregar, refreshKey]);

  return { completedSets, sessaoId, loading, erro, recarregar: carregar };
}
