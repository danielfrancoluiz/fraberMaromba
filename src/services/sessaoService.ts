import {
  EstatisticasSessaoAluno,
  EstatisticasSessaoProfessor,
  TreinoSessao,
} from "@/types";

interface ApiErrorBody {
  error?: string;
}

interface PaginacaoSessoes {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
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

export async function iniciarSessao(treinoId: string): Promise<TreinoSessao> {
  const res = await fetch("/api/aluno/sessoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ treinoId }),
  });
  const dados = await handleResponse<{ sessao: TreinoSessao }>(res);
  return dados.sessao;
}

export async function marcarSerieSessao(
  sessaoId: string,
  exercicioId: string,
  numeroSerie: number
): Promise<TreinoSessao> {
  const res = await fetch(`/api/aluno/sessoes/${encodeURIComponent(sessaoId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ acao: "marcar_serie", exercicioId, numeroSerie }),
  });
  const dados = await handleResponse<{ sessao: TreinoSessao }>(res);
  return dados.sessao;
}

export async function substituirExercicioSessao(
  sessaoId: string,
  exercicioId: string,
  substitutoCatalogoId: string
): Promise<TreinoSessao> {
  const res = await fetch(`/api/aluno/sessoes/${encodeURIComponent(sessaoId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      acao: "substituir",
      exercicioId,
      substitutoCatalogoId,
    }),
  });
  const dados = await handleResponse<{ sessao: TreinoSessao }>(res);
  return dados.sessao;
}

export async function finalizarSessao(
  sessaoId: string,
  duracaoSegundos: number
): Promise<TreinoSessao> {
  const res = await fetch(`/api/aluno/sessoes/${encodeURIComponent(sessaoId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ acao: "finalizar", duracaoSegundos }),
  });
  const dados = await handleResponse<{ sessao: TreinoSessao }>(res);
  return dados.sessao;
}

export async function cancelarSessao(sessaoId: string): Promise<void> {
  const res = await fetch(`/api/aluno/sessoes/${encodeURIComponent(sessaoId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ acao: "cancelar" }),
  });
  await handleResponse<{ sessao: TreinoSessao }>(res);
}

export async function listarSessoesAluno(
  pagina = 1,
  limite = 15
): Promise<{ itens: TreinoSessao[]; paginacao: PaginacaoSessoes }> {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
    status: "concluido",
  });
  const res = await fetch(`/api/aluno/sessoes?${params.toString()}`, {
    credentials: "include",
  });
  return handleResponse<{ itens: TreinoSessao[]; paginacao: PaginacaoSessoes }>(res);
}

export async function buscarSessaoAtivaTreino(
  treinoId: string
): Promise<TreinoSessao | null> {
  const params = new URLSearchParams({
    treinoId,
    status: "em_andamento",
  });
  const res = await fetch(`/api/aluno/sessoes?${params.toString()}`, {
    credentials: "include",
  });
  const dados = await handleResponse<{ sessao: TreinoSessao | null }>(res);
  return dados.sessao;
}

export async function contarSeriesConcluidasTreino(
  treinoId: string,
  totalSeries: number
): Promise<number> {
  const sessao = await buscarSessaoAtivaTreino(treinoId);
  if (!sessao) return 0;
  const concluidas = sessao.series.filter((s) => s.concluida).length;
  return Math.min(concluidas, totalSeries);
}

export async function buscarEstatisticasSessaoAluno(): Promise<EstatisticasSessaoAluno> {
  const res = await fetch("/api/aluno/sessoes?stats=1", { credentials: "include" });
  return handleResponse<EstatisticasSessaoAluno>(res);
}

export async function buscarEstatisticasSessaoProfessor(): Promise<EstatisticasSessaoProfessor> {
  const res = await fetch("/api/professor/sessoes/estatisticas", {
    credentials: "include",
  });
  return handleResponse<EstatisticasSessaoProfessor>(res);
}

export async function buscarEstatisticasSessaoAlunoProfessor(
  alunoId: string
): Promise<EstatisticasSessaoProfessor> {
  const res = await fetch(
    `/api/professor/alunos/${encodeURIComponent(alunoId)}/sessoes?stats=1`,
    { credentials: "include" }
  );
  return handleResponse<EstatisticasSessaoProfessor>(res);
}

export function formatarDuracaoSessao(segundos: number | null): string {
  if (segundos === null || segundos <= 0) return "—";
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m} min ${s}s` : `${m} min`;
}

export function formatarDataSessao(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
