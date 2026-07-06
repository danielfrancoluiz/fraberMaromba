import { GrupoMuscularId } from "@/lib/grupos-musculares";

export interface SubGrupoMuscular {
  id: string;
  label: string;
}

export const SUB_GRUPOS_MUSCULARES: Record<GrupoMuscularId, SubGrupoMuscular[]> = {
  peito: [
    { id: "peito_superior", label: "Peito superior" },
    { id: "peito_medio", label: "Peito médio" },
    { id: "peito_inferior", label: "Peito inferior" },
  ],
  costas: [
    { id: "dorsal", label: "Dorsal" },
    { id: "trapezio", label: "Trapézio" },
    { id: "lombar", label: "Lombar" },
    { id: "romboides", label: "Romboides" },
  ],
  pernas: [
    { id: "quadriceps", label: "Quadríceps" },
    { id: "posterior", label: "Posterior de coxa" },
    { id: "gluteos", label: "Glúteos" },
    { id: "panturrilha", label: "Panturrilha" },
    { id: "adutores", label: "Adutores" },
  ],
  ombros: [
    { id: "deltoide_anterior", label: "Deltoide anterior" },
    { id: "deltoide_lateral", label: "Deltoide lateral" },
    { id: "deltoide_posterior", label: "Deltoide posterior" },
  ],
  biceps: [
    { id: "biceps_braquial", label: "Bíceps braquial" },
    { id: "braquial", label: "Braquial" },
  ],
  triceps: [
    { id: "triceps_cabeca_longa", label: "Cabeça longa" },
    { id: "triceps_cabeca_lateral", label: "Cabeça lateral" },
    { id: "triceps_cabeca_medial", label: "Cabeça medial" },
  ],
  abdomen: [
    { id: "reto_abdominal", label: "Reto abdominal" },
    { id: "obliquos", label: "Oblíquos" },
    { id: "transverso", label: "Transverso" },
  ],
};

export function subGruposDoMembro(grupo: string): SubGrupoMuscular[] {
  const key = grupo.trim().toLowerCase() as GrupoMuscularId;
  return SUB_GRUPOS_MUSCULARES[key] ?? [];
}

export function labelSubGrupoMuscular(
  grupo: string,
  subGrupo?: string | null
): string {
  if (!subGrupo) return "";
  const lista = subGruposDoMembro(grupo);
  const found = lista.find((s) => s.id === subGrupo);
  return found?.label ?? subGrupo;
}
