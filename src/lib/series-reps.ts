/** Gera reps por série: ex. inicio=12, series=3, passo=2 → [12, 10, 8] */
export function gerarRepsDecrescentes(
  inicio: number,
  series: number,
  passo: number
): number[] {
  const inicioSafe = Math.max(1, Math.min(100, Math.floor(inicio)));
  const seriesSafe = Math.max(1, Math.min(20, Math.floor(series)));
  const passoSafe = Math.max(1, Math.min(20, Math.floor(passo)));

  return Array.from({ length: seriesSafe }, (_, i) =>
    Math.max(1, inicioSafe - i * passoSafe)
  );
}

export function isPrescricaoDecrescente(
  porSerie?: number[] | null
): boolean {
  if (!porSerie || porSerie.length < 2) return false;
  return porSerie.some((r) => r !== porSerie[0]);
}

export function repsDaSerie(
  exercicio: {
    repeticoes: number;
    repeticoesPorSerie?: number[] | null;
  },
  setIdx: number
): number {
  const lista = exercicio.repeticoesPorSerie;
  if (lista && lista.length > setIdx && Number.isFinite(lista[setIdx])) {
    return lista[setIdx];
  }
  return exercicio.repeticoes;
}

/** Ex.: "3 x 12" ou "12 → 10 → 8" */
export function formatarPrescricaoSeries(
  series: number,
  repeticoes: number,
  porSerie?: number[] | null
): string {
  if (isPrescricaoDecrescente(porSerie) && porSerie) {
    return porSerie.join(" → ");
  }
  return `${series} x ${repeticoes}`;
}

export function inferirPassoDecrescente(porSerie: number[]): number {
  if (porSerie.length < 2) return 2;
  const diff = porSerie[0] - porSerie[1];
  return diff > 0 ? diff : 2;
}
