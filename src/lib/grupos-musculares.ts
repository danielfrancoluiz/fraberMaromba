export const GRUPOS_MUSCULARES = [
  { id: "peito", label: "Peito" },
  { id: "costas", label: "Costas" },
  { id: "pernas", label: "Pernas" },
  { id: "ombros", label: "Ombros" },
  { id: "biceps", label: "Bíceps" },
  { id: "triceps", label: "Tríceps" },
  { id: "abdomen", label: "Abdômen" },
] as const;

export type GrupoMuscularId = (typeof GRUPOS_MUSCULARES)[number]["id"];

export function labelGrupoMuscular(grupo?: string | null): string {
  if (!grupo) return "";
  const key = grupo.trim().toLowerCase();
  const found = GRUPOS_MUSCULARES.find((g) => g.id === key);
  return found?.label ?? grupo;
}

export function normalizarGrupoMuscular(grupo: string): string {
  const key = grupo.trim().toLowerCase();
  const mapa: Record<string, string> = {
    peito: "peito",
    costas: "costas",
    pernas: "pernas",
    ombros: "ombros",
    bíceps: "biceps",
    biceps: "biceps",
    tríceps: "triceps",
    triceps: "triceps",
    abdômen: "abdomen",
    abdomen: "abdomen",
  };
  return mapa[key] ?? key;
}
