/** Mapeia nomes comuns (PT) para imagens do free-exercise-db (domínio público). */
const SLUG_POR_NOME: Record<string, string> = {
  "supino reto": "Barbell_Bench_Press_-_Medium_Grip",
  "supino inclinado": "Barbell_Incline_Bench_Press_-_Medium_Grip",
  crucifixo: "Dumbbell_Flyes",
  "puxada frontal": "Wide-Grip_Lat_Pulldown",
  "remada curvada": "Bent_Over_Barbell_Row",
  "remada unilateral": "One-Arm_Dumbbell_Row",
  "barra fixa": "Pullups",
  agachamento: "Barbell_Squat",
  "leg press": "Leg_Press",
  "cadeira extensora": "Leg_Extensions",
  "cadeira flexora": "Lying_Leg_Curls",
  desenvolvimento: "Barbell_Shoulder_Press",
  "elevação lateral": "Side_Lateral_Raise",
  "rosca direta": "Barbell_Curl",
  "rosca alternada": "Dumbbell_Alternate_Bicep_Curl",
  "rosca martelo": "Hammer_Curls",
  "tríceps pulley": "Triceps_Pushdown",
  "triceps pulley": "Triceps_Pushdown",
  "tríceps testa": "Lying_Triceps_Press",
  "triceps testa": "Lying_Triceps_Press",
  "flexão de braço": "Pushups",
  "flexao de braco": "Pushups",
  "abdominal crunch": "Crunches",
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
