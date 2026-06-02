import { Treino, ProgressoTreino, ExercicioSubstituto } from "@/types";

const PROGRESSO_STORAGE_KEY = "fraber_progresso";
const SUBSTITUTOS_STORAGE_KEY = "fraber_substitutos";

const ORDEM_DIAS: Treino["diaSemana"][] = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

const SUBSTITUTOS_PADRAO: ExercicioSubstituto[] = [
  { id: "sub-peito-1", nome: "Supino Reto", grupoMuscular: "Peito" },
  { id: "sub-peito-2", nome: "Supino Inclinado", grupoMuscular: "Peito" },
  { id: "sub-peito-3", nome: "Crucifixo", grupoMuscular: "Peito" },
  { id: "sub-peito-4", nome: "Flexão de Braço", grupoMuscular: "Peito" },
  { id: "sub-costas-1", nome: "Puxada Frontal", grupoMuscular: "Costas" },
  { id: "sub-costas-2", nome: "Remada Curvada", grupoMuscular: "Costas" },
  { id: "sub-costas-3", nome: "Remada Unilateral", grupoMuscular: "Costas" },
  { id: "sub-costas-4", nome: "Barra Fixa", grupoMuscular: "Costas" },
  { id: "sub-pernas-1", nome: "Agachamento", grupoMuscular: "Pernas" },
  { id: "sub-pernas-2", nome: "Leg Press", grupoMuscular: "Pernas" },
  { id: "sub-pernas-3", nome: "Cadeira Extensora", grupoMuscular: "Pernas" },
  { id: "sub-pernas-4", nome: "Cadeira Flexora", grupoMuscular: "Pernas" },
  { id: "sub-ombros-1", nome: "Desenvolvimento", grupoMuscular: "Ombros" },
  { id: "sub-ombros-2", nome: "Elevação Lateral", grupoMuscular: "Ombros" },
  { id: "sub-ombros-3", nome: "Elevação Frontal", grupoMuscular: "Ombros" },
  { id: "sub-biceps-1", nome: "Rosca Direta", grupoMuscular: "Bíceps" },
  { id: "sub-biceps-2", nome: "Rosca Alternada", grupoMuscular: "Bíceps" },
  { id: "sub-biceps-3", nome: "Rosca Martelo", grupoMuscular: "Bíceps" },
  { id: "sub-triceps-1", nome: "Tríceps Pulley", grupoMuscular: "Tríceps" },
  { id: "sub-triceps-2", nome: "Tríceps Testa", grupoMuscular: "Tríceps" },
  { id: "sub-triceps-3", nome: "Mergulho", grupoMuscular: "Tríceps" },
  { id: "sub-abdomen-1", nome: "Abdominal Crunch", grupoMuscular: "Abdômen" },
  { id: "sub-abdomen-2", nome: "Prancha", grupoMuscular: "Abdômen" },
  { id: "sub-abdomen-3", nome: "Elevação de Pernas", grupoMuscular: "Abdômen" },
];

interface ApiErrorBody {
  error?: string;
}

interface ExercicioApi {
  id: string;
  nome: string;
  series: number;
  repeticoes: number;
  grupoMuscular?: string | null;
  observacao?: string | null;
}

interface TreinoApi {
  id: string;
  alunoId: string;
  professorId: string;
  nome: string;
  diaSemana: string;
  dataCriacao: string;
  exercicios: ExercicioApi[];
}

type TreinosPorDiaApi = Record<string, TreinoApi[]>;

function isDiaSemana(value: string): value is Treino["diaSemana"] {
  return ORDEM_DIAS.includes(value as Treino["diaSemana"]);
}

function mapTreino(treino: TreinoApi): Treino {
  return {
    id: treino.id,
    alunoId: treino.alunoId,
    professorId: treino.professorId,
    nome: treino.nome,
    diaSemana: isDiaSemana(treino.diaSemana) ? treino.diaSemana : "segunda",
    dataCriacao: treino.dataCriacao,
    exercicios: treino.exercicios.map((exercicio) => ({
      id: exercicio.id,
      nome: exercicio.nome,
      series: exercicio.series,
      repeticoes: exercicio.repeticoes,
      observacao: exercicio.observacao ?? undefined,
      grupoMuscular: exercicio.grupoMuscular ?? undefined,
    })),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const mensagem =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as ApiErrorBody).error === "string"
        ? (body as ApiErrorBody).error
        : "Erro na requisição";
    throw new Error(mensagem);
  }

  return res.json() as Promise<T>;
}

function lerProgressoStorage(): ProgressoTreino[] {
  const dados = localStorage.getItem(PROGRESSO_STORAGE_KEY);
  if (!dados) return [];

  const parsed: unknown = JSON.parse(dados);
  if (!Array.isArray(parsed)) return [];

  return parsed as ProgressoTreino[];
}

function salvarProgressoStorage(progressos: ProgressoTreino[]): void {
  localStorage.setItem(PROGRESSO_STORAGE_KEY, JSON.stringify(progressos));
}

function lerSubstitutosStorage(): ExercicioSubstituto[] {
  const dados = localStorage.getItem(SUBSTITUTOS_STORAGE_KEY);
  if (!dados) return [];

  const parsed: unknown = JSON.parse(dados);
  if (!Array.isArray(parsed)) return [];

  return parsed as ExercicioSubstituto[];
}

function filtrarSubstitutosPorGrupo(
  lista: ExercicioSubstituto[],
  grupoMuscular: string
): ExercicioSubstituto[] {
  const grupo = grupoMuscular.trim().toLowerCase();

  if (grupo === "outros") {
    return lista;
  }

  return lista.filter(
    (item) => item.grupoMuscular.toLowerCase() === grupo
  );
}

export async function listarTreinosDoAlunoPorDia(
  _alunoId: string
): Promise<Record<string, Treino[]>> {
  const res = await fetch("/api/aluno/treinos");
  const agrupado = await handleResponse<TreinosPorDiaApi>(res);

  const resultado: Record<string, Treino[]> = {};

  for (const dia of ORDEM_DIAS) {
    const treinos = agrupado[dia];
    if (treinos && treinos.length > 0) {
      resultado[dia] = treinos.map(mapTreino);
    }
  }

  return resultado;
}

export async function buscarProgresso(
  treinoId: string,
  alunoId: string
): Promise<ProgressoTreino | null> {
  const progressos = lerProgressoStorage();
  const progresso = progressos.find(
    (item) => item.treinoId === treinoId && item.alunoId === alunoId
  );
  return progresso ?? null;
}

export async function salvarProgresso(
  progresso: ProgressoTreino
): Promise<void> {
  const progressos = lerProgressoStorage();
  const index = progressos.findIndex(
    (item) =>
      item.treinoId === progresso.treinoId &&
      item.alunoId === progresso.alunoId
  );

  if (index === -1) {
    salvarProgressoStorage([...progressos, progresso]);
    return;
  }

  const atualizados = [...progressos];
  atualizados[index] = progresso;
  salvarProgressoStorage(atualizados);
}

export async function limparProgresso(
  treinoId: string,
  alunoId: string
): Promise<void> {
  const progressos = lerProgressoStorage();
  const filtrados = progressos.filter(
    (item) => !(item.treinoId === treinoId && item.alunoId === alunoId)
  );
  salvarProgressoStorage(filtrados);
}

export async function listarSubstitutos(
  grupoMuscular: string
): Promise<ExercicioSubstituto[]> {
  const salvos = lerSubstitutosStorage();
  const base = salvos.length > 0 ? salvos : SUBSTITUTOS_PADRAO;
  return filtrarSubstitutosPorGrupo(base, grupoMuscular);
}
