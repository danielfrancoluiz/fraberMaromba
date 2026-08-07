import { describe, expect, it } from "vitest";
import { montarProgressoSeries } from "@/lib/treino-progresso";
import type { Exercicio, TreinoSessao } from "@/types";

function exercicio(id: string, series: number): Exercicio {
  return {
    id,
    nome: id,
    series,
    repeticoes: 12,
    ordem: 0,
  };
}

function sessao(series: TreinoSessao["series"]): TreinoSessao {
  return {
    id: "s1",
    treinoId: "t1",
    alunoId: "a1",
    iniciadoEm: new Date().toISOString(),
    finalizadoEm: null,
    duracaoSegundos: null,
    status: "em_andamento",
    series,
  };
}

describe("montarProgressoSeries", () => {
  it("marca exercício concluído quando todas as séries estão no banco", () => {
    const ex = exercicio("ex1", 3);
    const progresso = montarProgressoSeries([ex], sessao([
      { id: "1", exercicioId: "ex1", numeroSerie: 1, concluida: true },
      { id: "2", exercicioId: "ex1", numeroSerie: 2, concluida: true },
      { id: "3", exercicioId: "ex1", numeroSerie: 3, concluida: true },
    ]));

    expect(progresso.ex1.every(Boolean)).toBe(true);
  });

  it("ignora séries fora do range quando o treino foi reduzido", () => {
    const ex = exercicio("ex1", 2);
    const progresso = montarProgressoSeries([ex], sessao([
      { id: "1", exercicioId: "ex1", numeroSerie: 1, concluida: true },
      { id: "2", exercicioId: "ex1", numeroSerie: 2, concluida: true },
      { id: "3", exercicioId: "ex1", numeroSerie: 3, concluida: true },
    ]));

    expect(progresso.ex1).toEqual([true, true]);
  });
});
