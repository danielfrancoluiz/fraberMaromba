export interface ExercicioInputPayload {
  nome: string;
  series: number;
  repeticoes: number;
  repeticoesPorSerie?: number[];
  grupoMuscular?: string;
  observacao?: string;
  ordem?: number;
  exercicioCatalogoId?: string;
  restSeconds?: number;
}

function isIntArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((n) => typeof n === "number" && Number.isInteger(n) && n >= 1)
  );
}

export function isExercicioInputPayload(value: unknown): value is ExercicioInputPayload {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.nome === "string" &&
    typeof dados.series === "number" &&
    typeof dados.repeticoes === "number" &&
    (dados.repeticoesPorSerie === undefined || isIntArray(dados.repeticoesPorSerie)) &&
    (dados.grupoMuscular === undefined || typeof dados.grupoMuscular === "string") &&
    (dados.observacao === undefined || typeof dados.observacao === "string") &&
    (dados.ordem === undefined || typeof dados.ordem === "number") &&
    (dados.exercicioCatalogoId === undefined ||
      typeof dados.exercicioCatalogoId === "string") &&
    (dados.restSeconds === undefined || typeof dados.restSeconds === "number")
  );
}

export function mapExercicioCreateInput(
  exercicio: ExercicioInputPayload,
  index: number
) {
  const porSerie = exercicio.repeticoesPorSerie ?? [];
  const listaValida =
    porSerie.length === exercicio.series
      ? porSerie
      : [];

  return {
    nome: exercicio.nome.trim(),
    series: exercicio.series,
    repeticoes: listaValida.length > 0 ? listaValida[0] : exercicio.repeticoes,
    repeticoesPorSerie: listaValida,
    grupoMuscular: exercicio.grupoMuscular?.trim() || null,
    observacao: exercicio.observacao?.trim() || null,
    ordem: exercicio.ordem ?? index + 1,
    exercicioCatalogoId: exercicio.exercicioCatalogoId ?? null,
    restSeconds: exercicio.restSeconds ?? 60,
  };
}
