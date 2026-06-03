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
    slug: "Barbell_Bench_Press",
    grupoMuscular: "peito",
    equipamento: "Barra",
    dificuldade: "intermediario",
    descricao: "Deitado no banco, desça a barra até o peito e empurre para cima.",
    ...urls("Barbell_Bench_Press"),
  },
  {
    nome: "Supino Inclinado",
    slug: "Incline_Barbell_Bench_Press",
    grupoMuscular: "peito",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Incline_Barbell_Bench_Press"),
  },
  {
    nome: "Crucifixo",
    slug: "Dumbbell_Fly",
    grupoMuscular: "peito",
    equipamento: "Halteres",
    dificuldade: "iniciante",
    ...urls("Dumbbell_Fly"),
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
    slug: "Barbell_Bent_Over_Row",
    grupoMuscular: "costas",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Barbell_Bent_Over_Row"),
  },
  {
    nome: "Remada Unilateral",
    slug: "Dumbbell_One-Arm_Row",
    grupoMuscular: "costas",
    equipamento: "Halter",
    dificuldade: "iniciante",
    ...urls("Dumbbell_One-Arm_Row"),
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
    slug: "Dumbbell_Lateral_Raise",
    grupoMuscular: "ombros",
    equipamento: "Halteres",
    dificuldade: "iniciante",
    ...urls("Dumbbell_Lateral_Raise"),
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
    slug: "Lying_Close-Grip_Barbell_Triliceps_Extension",
    grupoMuscular: "triceps",
    equipamento: "Barra",
    dificuldade: "intermediario",
    ...urls("Lying_Close-Grip_Barbell_Triliceps_Extension"),
  },
  {
    nome: "Abdominal Crunch",
    slug: "Crunch",
    grupoMuscular: "abdomen",
    equipamento: "Peso corporal",
    dificuldade: "iniciante",
    ...urls("Crunch"),
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
