import type { Exercicio, TreinoSessao } from "@/types";

export function montarProgressoSeries(
  exercicios: Exercicio[],
  sessao: TreinoSessao
): Record<string, boolean[]> {
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

  return completedSets;
}

export function exercicioConcluido(
  completedSets: Record<string, boolean[]>,
  exercicio: Exercicio
): boolean {
  const arr = completedSets[exercicio.id];
  if (!arr || arr.length === 0) return false;
  return arr.every(Boolean);
}

export function seriesConcluidasExercicio(
  completedSets: Record<string, boolean[]>,
  exercicio: Exercicio
): number {
  const arr = completedSets[exercicio.id] ?? [];
  return arr.filter(Boolean).length;
}

export function primeiroSetIncompleto(
  completedSets: Record<string, boolean[]>,
  exercicio: Exercicio
): number {
  const arr = completedSets[exercicio.id] ?? [];
  const idx = arr.findIndex((done) => !done);
  return idx >= 0 ? idx : 0;
}

export function totalSeriesConcluidas(
  completedSets: Record<string, boolean[]>
): number {
  return Object.values(completedSets)
    .flat()
    .filter(Boolean).length;
}

export function todosExerciciosConcluidos(
  exercicios: Exercicio[],
  completedSets: Record<string, boolean[]>
): boolean {
  return exercicios.length > 0 && exercicios.every((ex) => exercicioConcluido(completedSets, ex));
}
