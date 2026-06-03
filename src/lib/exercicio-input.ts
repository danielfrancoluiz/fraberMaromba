export interface ExercicioInputPayload {
  nome: string;
  series: number;
  repeticoes: number;
  grupoMuscular?: string;
  observacao?: string;
  ordem?: number;
  exercicioCatalogoId?: string;
  restSeconds?: number;
}

export function isExercicioInputPayload(value: unknown): value is ExercicioInputPayload {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.nome === "string" &&
    typeof dados.series === "number" &&
    typeof dados.repeticoes === "number" &&
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
  return {
    nome: exercicio.nome.trim(),
    series: exercicio.series,
    repeticoes: exercicio.repeticoes,
    grupoMuscular: exercicio.grupoMuscular?.trim() || null,
    observacao: exercicio.observacao?.trim() || null,
    ordem: exercicio.ordem ?? index + 1,
    exercicioCatalogoId: exercicio.exercicioCatalogoId ?? null,
    restSeconds: exercicio.restSeconds ?? 60,
  };
}
