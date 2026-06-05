/** Dados do catálogo — imagens do free-exercise-db (domínio público). */
const BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export type ExercicioCatalogoSeed = {
  nome: string;
  slug: string;
  grupoMuscular: string;
  equipamento?: string;
  dificuldade?: string;
  descricao?: string;
};

function urls(slug: string) {
  return {
    imagemUrl: `${BASE}/${slug}/0.jpg`,
    gifUrl: `${BASE}/${slug}/0.jpg`,
  };
}

export const EXERCICIOS_CATALOGO_SEED: Array<
  ExercicioCatalogoSeed & { imagemUrl: string; gifUrl: string }
> = [
  {
    nome: "Supino Reto",
    slug: "Barbell_Bench_Press_-_Medium_Grip",
    grupoMuscular: "peito",
    equipamento: "Barra",
    dificuldade: "intermediario",
    descricao: "Deitado no banco, desça a barra até o peito e empurre para cima.",
    ...urls("Barbell_Bench_Press_-_Medium_Grip"),
  },
  {
    nome: "Supino Inclinado",
    slug: "Barbell_Incline_Bench_Press_-_Medium_Grip",
    grupoMuscular: "peito",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Barbell_Incline_Bench_Press_-_Medium_Grip"),
  },
  {
    nome: "Crucifixo",
    slug: "Dumbbell_Flyes",
    grupoMuscular: "peito",
    equipamento: "Halteres",
    dificuldade: "iniciante",
    ...urls("Dumbbell_Flyes"),
  },
  {
    nome: "Flexão de Braço",
    slug: "Pushups",
    grupoMuscular: "peito",
    equipamento: "Peso corporal",
    dificuldade: "iniciante",
    ...urls("Pushups"),
  },
  {
    nome: "Puxada Frontal",
    slug: "Wide-Grip_Lat_Pulldown",
    grupoMuscular: "costas",
    equipamento: "Polia",
    dificuldade: "iniciante",
    ...urls("Wide-Grip_Lat_Pulldown"),
  },
  {
    nome: "Remada Curvada",
    slug: "Bent_Over_Barbell_Row",
    grupoMuscular: "costas",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Bent_Over_Barbell_Row"),
  },
  {
    nome: "Remada Unilateral",
    slug: "One-Arm_Dumbbell_Row",
    grupoMuscular: "costas",
    equipamento: "Halter",
    dificuldade: "iniciante",
    ...urls("One-Arm_Dumbbell_Row"),
  },
  {
    nome: "Barra Fixa",
    slug: "Pullups",
    grupoMuscular: "costas",
    equipamento: "Peso corporal",
    dificuldade: "avancado",
    ...urls("Pullups"),
  },
  {
    nome: "Agachamento",
    slug: "Barbell_Squat",
    grupoMuscular: "pernas",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Barbell_Squat"),
  },
  {
    nome: "Leg Press",
    slug: "Leg_Press",
    grupoMuscular: "pernas",
    equipamento: "Máquina",
    dificuldade: "iniciante",
    ...urls("Leg_Press"),
  },
  {
    nome: "Cadeira Extensora",
    slug: "Leg_Extensions",
    grupoMuscular: "pernas",
    equipamento: "Máquina",
    dificuldade: "iniciante",
    ...urls("Leg_Extensions"),
  },
  {
    nome: "Cadeira Flexora",
    slug: "Lying_Leg_Curls",
    grupoMuscular: "pernas",
    equipamento: "Máquina",
    dificuldade: "iniciante",
    ...urls("Lying_Leg_Curls"),
  },
  {
    nome: "Stiff",
    slug: "Stiff-Legged_Barbell_Deadlift",
    grupoMuscular: "pernas",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Stiff-Legged_Barbell_Deadlift"),
  },
  {
    nome: "Desenvolvimento",
    slug: "Barbell_Shoulder_Press",
    grupoMuscular: "ombros",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Barbell_Shoulder_Press"),
  },
  {
    nome: "Elevação Lateral",
    slug: "Side_Lateral_Raise",
    grupoMuscular: "ombros",
    equipamento: "Halteres",
    dificuldade: "iniciante",
    ...urls("Side_Lateral_Raise"),
  },
  {
    nome: "Rosca Direta",
    slug: "Barbell_Curl",
    grupoMuscular: "biceps",
    equipamento: "Barra",
    dificuldade: "iniciante",
    ...urls("Barbell_Curl"),
  },
  {
    nome: "Rosca Alternada",
    slug: "Dumbbell_Alternate_Bicep_Curl",
    grupoMuscular: "biceps",
    equipamento: "Halteres",
    dificuldade: "iniciante",
    ...urls("Dumbbell_Alternate_Bicep_Curl"),
  },
  {
    nome: "Rosca Martelo",
    slug: "Hammer_Curls",
    grupoMuscular: "biceps",
    equipamento: "Halteres",
    dificuldade: "iniciante",
    ...urls("Hammer_Curls"),
  },
  {
    nome: "Tríceps Pulley",
    slug: "Triceps_Pushdown",
    grupoMuscular: "triceps",
    equipamento: "Polia",
    dificuldade: "iniciante",
    ...urls("Triceps_Pushdown"),
  },
  {
    nome: "Tríceps Testa",
    slug: "Lying_Triceps_Press",
    grupoMuscular: "triceps",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Lying_Triceps_Press"),
  },
  {
    nome: "Abdominal Crunch",
    slug: "Crunches",
    grupoMuscular: "abdomen",
    equipamento: "Peso corporal",
    dificuldade: "iniciante",
    ...urls("Crunches"),
  },
  {
    nome: "Prancha",
    slug: "Plank",
    grupoMuscular: "abdomen",
    equipamento: "Peso corporal",
    dificuldade: "iniciante",
    ...urls("Plank"),
  },
  {
    nome: "Elevação de Panturrilha",
    slug: "Standing_Calf_Raises",
    grupoMuscular: "pernas",
    equipamento: "Máquina",
    dificuldade: "iniciante",
    ...urls("Standing_Calf_Raises"),
  },
  {
    nome: "Afundo",
    slug: "Dumbbell_Lunges",
    grupoMuscular: "pernas",
    equipamento: "Halteres",
    dificuldade: "intermediario",
    ...urls("Dumbbell_Lunges"),
  },
  {
    nome: "Puxada Supinada",
    slug: "Close-Grip_Front_Lat_Pulldown",
    grupoMuscular: "costas",
    equipamento: "Polia",
    dificuldade: "iniciante",
    ...urls("Close-Grip_Front_Lat_Pulldown"),
  },
];
