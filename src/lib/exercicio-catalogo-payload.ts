export interface ExercicioCatalogoPayload {
  nome: string;
  gifUrl?: string;
  grupoMuscular: string;
  subGrupoMuscular: string;
  series: number;
  repeticoes: number;
  descanso: number;
  unilateral: boolean;
}

export function isExercicioCatalogoPayload(value: unknown): value is ExercicioCatalogoPayload {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.nome === "string" &&
    typeof dados.grupoMuscular === "string" &&
    typeof dados.subGrupoMuscular === "string" &&
    typeof dados.series === "number" &&
    typeof dados.repeticoes === "number" &&
    typeof dados.descanso === "number" &&
    typeof dados.unilateral === "boolean" &&
    (dados.gifUrl === undefined || typeof dados.gifUrl === "string")
  );
}
