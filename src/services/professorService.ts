import {
  Aluno,
  Convite,
  Exercicio,
  Plano,
  Treino,
  TreinoComAluno,
  TreinoTemplate,
} from "@/types";
import { mensagemErroBanco } from "@/lib/erro-banco";

interface ApiErrorBody {
  error?: string;
}

interface AlunoApi {
  id: string;
  professorId: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: string;
  dataNascimento: string;
  peso: number;
  altura: number;
  objetivo: string;
  planoId: string;
  dataCadastro: string;
}

interface ExercicioCatalogoApi {
  id: string;
  nome: string;
  slug: string;
  grupoMuscular: string;
  equipamento?: string | null;
  dificuldade?: string | null;
  descricao?: string | null;
  gifUrl?: string | null;
  imagemUrl?: string | null;
  unilateral?: boolean;
}

interface ExercicioApi {
  id: string;
  nome: string;
  series: number;
  repeticoes: number;
  repeticoesPorSerie?: number[] | null;
  grupoMuscular?: string | null;
  observacao?: string | null;
  restSeconds?: number | null;
  exercicioCatalogoId?: string | null;
  catalogo?: ExercicioCatalogoApi | null;
}

interface TreinoApi {
  id: string;
  alunoId: string;
  professorId: string;
  nome: string;
  descricao?: string | null;
  objetivo?: string | null;
  diaSemana: string;
  dataCriacao: string;
  exercicios: ExercicioApi[];
  aluno?: { id: string; nomeCompleto: string } | null;
}

interface TreinoTemplateApi {
  id: string;
  professorId: string;
  nome: string;
  descricao?: string | null;
  dataCriacao: string;
  exercicios: ExercicioApi[];
}

interface ConviteApi {
  id: string;
  token: string;
  professorId: string;
  email?: string | null;
  usado: boolean;
  dataCriacao: string;
}

const DIAS_SEMANA: Treino["diaSemana"][] = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

function isDiaSemana(value: string): value is Treino["diaSemana"] {
  return DIAS_SEMANA.includes(value as Treino["diaSemana"]);
}

function isSexoAluno(value: string): value is Aluno["sexo"] {
  return value === "masculino" || value === "feminino" || value === "outro";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const erroApi =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as ApiErrorBody).error === "string"
        ? (body as ApiErrorBody).error
        : null;

    if (res.status === 401) {
      throw new Error(
        erroApi === "Não autorizado"
          ? "Acesso negado. Faça login como professor para continuar."
          : (erroApi ?? "Acesso negado. Faça login como professor para continuar.")
      );
    }

    throw new Error(
      erroApi ? mensagemErroBanco(new Error(erroApi)) : "Erro na requisição"
    );
  }

  return res.json() as Promise<T>;
}

function mapExercicioPayload(exercicio: Exercicio, index: number) {
  return {
    nome: exercicio.nome,
    series: exercicio.series,
    repeticoes: exercicio.repeticoes,
    repeticoesPorSerie: exercicio.repeticoesPorSerie ?? [],
    grupoMuscular: exercicio.grupoMuscular,
    observacao: exercicio.observacao,
    ordem: index + 1,
    exercicioCatalogoId: exercicio.exercicioCatalogoId,
    restSeconds: exercicio.restSeconds ?? 60,
  };
}

function mapExercicio(exercicio: ExercicioApi): Exercicio {
  return {
    id: exercicio.id,
    nome: exercicio.nome,
    series: exercicio.series,
    repeticoes: exercicio.repeticoes,
    repeticoesPorSerie:
      exercicio.repeticoesPorSerie && exercicio.repeticoesPorSerie.length > 0
        ? exercicio.repeticoesPorSerie
        : undefined,
    observacao: exercicio.observacao ?? undefined,
    grupoMuscular: exercicio.grupoMuscular ?? undefined,
    exercicioCatalogoId: exercicio.exercicioCatalogoId ?? undefined,
    imagemUrl:
      exercicio.catalogo?.imagemUrl ??
      exercicio.catalogo?.gifUrl ??
      undefined,
    gifUrl: exercicio.catalogo?.gifUrl ?? undefined,
    descricao: exercicio.catalogo?.descricao ?? undefined,
    equipamento: exercicio.catalogo?.equipamento ?? undefined,
    dificuldade: exercicio.catalogo?.dificuldade ?? undefined,
    restSeconds: exercicio.restSeconds ?? 60,
    unilateral: exercicio.catalogo?.unilateral ?? false,
  };
}

function mapAluno(aluno: AlunoApi): Aluno {
  return {
    id: aluno.id,
    professorId: aluno.professorId,
    nomeCompleto: aluno.nomeCompleto,
    cpf: aluno.cpf,
    email: aluno.email,
    telefone: aluno.telefone,
    sexo: isSexoAluno(aluno.sexo) ? aluno.sexo : "outro",
    dataNascimento: aluno.dataNascimento,
    peso: aluno.peso,
    altura: aluno.altura,
    objetivo: aluno.objetivo,
    planoId: aluno.planoId,
    dataCadastro: aluno.dataCadastro,
  };
}

function mapTreino(treino: TreinoApi): Treino {
  return {
    id: treino.id,
    alunoId: treino.alunoId,
    professorId: treino.professorId,
    nome: treino.nome,
    descricao: treino.descricao ?? undefined,
    objetivo: treino.objetivo ?? undefined,
    diaSemana: isDiaSemana(treino.diaSemana) ? treino.diaSemana : "segunda",
    dataCriacao: treino.dataCriacao,
    exercicios: treino.exercicios.map(mapExercicio),
  };
}

function mapTreinoComAluno(treino: TreinoApi): TreinoComAluno {
  return {
    ...mapTreino(treino),
    alunoNome: treino.aluno?.nomeCompleto,
  };
}

function mapTemplate(template: TreinoTemplateApi): TreinoTemplate {
  return {
    id: template.id,
    professorId: template.professorId,
    nome: template.nome,
    descricao: template.descricao ?? undefined,
    dataCriacao: template.dataCriacao,
    exercicios: template.exercicios.map(mapExercicio),
  };
}

function mapConvite(convite: ConviteApi): Convite {
  return {
    id: convite.id,
    token: convite.token,
    professorId: convite.professorId,
    email: convite.email ?? undefined,
    usado: convite.usado,
    dataCriacao: convite.dataCriacao,
    dataExpiracao: convite.dataCriacao,
  };
}

export async function cadastrarAluno(
  dados: Omit<Aluno, "id" | "dataCadastro" | "professorId">
): Promise<Aluno> {
  const res = await fetch("/api/professor/alunos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dados),
  });

  const aluno = await handleResponse<AlunoApi>(res);
  return mapAluno(aluno);
}

export async function listarAlunos(_professorId: string): Promise<Aluno[]> {
  const res = await fetch("/api/professor/alunos", {
    credentials: "include",
  });
  const alunos = await handleResponse<AlunoApi[]>(res);
  return alunos.map(mapAluno);
}

export async function buscarPlanos(opcoes?: {
  checkout?: boolean;
  todos?: boolean;
}): Promise<Plano[]> {
  const params = new URLSearchParams();
  if (opcoes?.checkout) params.set("checkout", "1");
  if (opcoes?.todos) params.set("todos", "1");
  const qs = params.toString();
  const res = await fetch(`/api/planos${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  return handleResponse<Plano[]>(res);
}

export async function atualizarPlano(
  id: string,
  dados: {
    nome?: string;
    valorCentavos?: number;
    diasValidade?: number;
    permiteCheckout?: boolean;
    ativo?: boolean;
    ordem?: number;
  }
): Promise<Plano> {
  const res = await fetch(`/api/planos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dados),
  });
  return handleResponse<Plano>(res);
}

export async function criarTreino(
  dados: Omit<Treino, "id" | "dataCriacao">
): Promise<Treino> {
  const res = await fetch("/api/professor/treinos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      alunoId: dados.alunoId,
      nome: dados.nome,
      descricao: dados.descricao,
      objetivo: dados.objetivo,
      diaSemana: dados.diaSemana,
      exercicios: dados.exercicios.map(mapExercicioPayload),
    }),
  });

  const treino = await handleResponse<TreinoApi>(res);
  return mapTreino(treino);
}

export async function buscarTreino(id: string): Promise<Treino | null> {
  const res = await fetch(`/api/professor/treinos/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  if (res.status === 404) return null;
  const treino = await handleResponse<TreinoApi>(res);
  return mapTreino(treino);
}

export async function atualizarTreino(
  id: string,
  dados: {
    alunoId?: string;
    nome?: string;
    descricao?: string;
    objetivo?: string;
    diaSemana?: Treino["diaSemana"];
    exercicios?: Exercicio[];
  }
): Promise<Treino> {
  const res = await fetch(`/api/professor/treinos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...(dados.alunoId !== undefined ? { alunoId: dados.alunoId } : {}),
      ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
      ...(dados.descricao !== undefined ? { descricao: dados.descricao } : {}),
      ...(dados.objetivo !== undefined ? { objetivo: dados.objetivo } : {}),
      ...(dados.diaSemana !== undefined ? { diaSemana: dados.diaSemana } : {}),
      ...(dados.exercicios !== undefined
        ? { exercicios: dados.exercicios.map(mapExercicioPayload) }
        : {}),
    }),
  });

  const treino = await handleResponse<TreinoApi>(res);
  return mapTreino(treino);
}

export async function deletarTreino(id: string): Promise<void> {
  const res = await fetch(`/api/professor/treinos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse<{ sucesso: boolean }>(res);
}

export async function listarTreinosProfessor(): Promise<TreinoComAluno[]> {
  const res = await fetch("/api/professor/treinos", { credentials: "include" });
  const treinos = await handleResponse<TreinoApi[]>(res);
  return treinos.map(mapTreinoComAluno);
}

export async function listarTreinosDoAluno(alunoId: string): Promise<Treino[]> {
  const res = await fetch(
    `/api/professor/treinos?alunoId=${encodeURIComponent(alunoId)}`
  );
  const treinos = await handleResponse<TreinoApi[]>(res);
  return treinos.map(mapTreino);
}

export async function buscarAluno(id: string): Promise<Aluno | null> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`);

  if (res.status === 404) {
    return null;
  }

  const aluno = await handleResponse<AlunoApi>(res);
  return mapAluno(aluno);
}

export async function atualizarAluno(
  id: string,
  dados: Partial<Omit<Aluno, "id" | "professorId" | "dataCadastro">>
): Promise<Aluno> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const aluno = await handleResponse<AlunoApi>(res);
  return mapAluno(aluno);
}

export async function deletarAluno(id: string): Promise<void> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse<{ sucesso: boolean }>(res);
}

export async function criarTemplate(
  dados: Omit<TreinoTemplate, "id" | "dataCriacao">
): Promise<TreinoTemplate> {
  const res = await fetch("/api/professor/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: dados.nome,
      descricao: dados.descricao,
      exercicios: dados.exercicios.map(mapExercicioPayload),
    }),
  });

  const template = await handleResponse<TreinoTemplateApi>(res);
  return mapTemplate(template);
}

export async function listarTemplates(
  _professorId: string
): Promise<TreinoTemplate[]> {
  const res = await fetch("/api/professor/templates");
  const templates = await handleResponse<TreinoTemplateApi[]>(res);
  return templates.map(mapTemplate);
}

export async function atualizarTemplate(
  id: string,
  dados: {
    nome?: string;
    descricao?: string;
    exercicios?: Exercicio[];
  }
): Promise<TreinoTemplate> {
  const res = await fetch(`/api/professor/templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
      ...(dados.descricao !== undefined ? { descricao: dados.descricao } : {}),
      ...(dados.exercicios !== undefined
        ? {
            exercicios: dados.exercicios.map(mapExercicioPayload),
          }
        : {}),
    }),
  });

  const template = await handleResponse<TreinoTemplateApi>(res);
  return mapTemplate(template);
}

export async function deletarTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/professor/templates/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await handleResponse<{ sucesso: boolean }>(res);
}

export async function atribuirTemplatePAraAluno(
  templateId: string,
  alunoId: string,
  _professorId: string,
  diaSemana: Treino["diaSemana"]
): Promise<Treino> {
  const templates = await listarTemplates(_professorId);
  const template = templates.find((item) => item.id === templateId);

  if (!template) {
    throw new Error("Template não encontrado");
  }

  return criarTreino({
    alunoId,
    professorId: template.professorId,
    nome: template.nome,
    diaSemana,
    exercicios: template.exercicios.map((exercicio) => ({ ...exercicio })),
  });
}

export async function gerarConvite(
  _professorId: string,
  email?: string
): Promise<Convite> {
  const res = await fetch("/api/professor/convites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(email ? { email } : {}),
  });

  const convite = await handleResponse<ConviteApi>(res);
  return mapConvite(convite);
}

export async function buscarConvitePorToken(token: string): Promise<Convite | null> {
  const res = await fetch(
    `/api/professor/convites?token=${encodeURIComponent(token)}`
  );

  if (res.status === 404) {
    return null;
  }

  const convite = await handleResponse<ConviteApi>(res);
  return mapConvite(convite);
}

export async function marcarConviteComoUsado(token: string): Promise<void> {
  const res = await fetch(
    `/api/professor/convites/${encodeURIComponent(token)}`,
    { method: "PATCH" }
  );

  await handleResponse<ConviteApi>(res);
}
