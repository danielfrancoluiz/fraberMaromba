/** Mapeia nomes comuns (PT) para imagens do free-exercise-db (domínio público). */
const SLUG_POR_NOME: Record<string, string> = {
  "supino reto": "Barbell_Bench_Press",
  "supino inclinado": "Incline_Barbell_Bench_Press",
  crucifixo: "Dumbbell_Fly",
  "puxada frontal": "Wide-Grip_Lat_Pulldown",
  "remada curvada": "Barbell_Bent_Over_Row",
  "remada unilateral": "Dumbbell_One-Arm_Row",
  "barra fixa": "Pullups",
  agachamento: "Barbell_Squat",
  "leg press": "Leg_Press",
  "cadeira extensora": "Leg_Extensions",
  "cadeira flexora": "Lying_Leg_Curls",
  desenvolvimento: "Barbell_Shoulder_Press",
  "elevação lateral": "Dumbbell_Lateral_Raise",
  "rosca direta": "Barbell_Curl",
  "rosca alternada": "Dumbbell_Alternate_Bicep_Curl",
  "rosca martelo": "Hammer_Curls",
  "tríceps pulley": "Triceps_Pushdown",
  "triceps pulley": "Triceps_Pushdown",
  "tríceps testa": "Lying_Close-Grip_Barbell_Triliceps_Extension",
  "triceps testa": "Lying_Close-Grip_Barbell_Triliceps_Extension",
  "flexão de braço": "Pushups",
  "flexao de braco": "Pushups",
  "abdominal crunch": "Crunch",
  prancha: "Plank",
};

const BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export function getExercicioImagemUrl(nome: string): string | null {
  const chave = nome.trim().toLowerCase();
  let slug: string | undefined = SLUG_POR_NOME[chave];

  if (!slug) {
    const parcial = Object.entries(SLUG_POR_NOME).find(
      ([key]) => chave.includes(key) || key.includes(chave)
    );
    slug = parcial?.[1];
  }

  if (!slug) return null;
  return `${BASE_URL}/${slug}/0.jpg`;
}

export function getGrupoMuscularCor(grupo?: string): string {
  const mapa: Record<string, string> = {
    peito: "#3b82f6",
    costas: "#6366f1",
    pernas: "#22c55e",
    ombros: "#f59e0b",
    bíceps: "#ec4899",
    biceps: "#ec4899",
    tríceps: "#e8001c",
    triceps: "#e8001c",
    abdômen: "#14b8a6",
    abdomen: "#14b8a6",
  };
  const key = grupo?.trim().toLowerCase() ?? "";
  return mapa[key] ?? "#64748b";
}
