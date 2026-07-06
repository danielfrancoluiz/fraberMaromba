import { ExercicioCatalogo } from "@/types";

interface PaginacaoApi {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

interface ListarExerciciosResponse {
  itens: ExercicioCatalogo[];
  paginacao: PaginacaoApi;
}

export async function listarExerciciosCatalogo(params: {
  busca?: string;
  grupo?: string;
  pagina?: number;
  limite?: number;
}): Promise<ListarExerciciosResponse> {
  const search = new URLSearchParams();
  if (params.busca?.trim()) search.set("busca", params.busca.trim());
  if (params.grupo?.trim()) search.set("grupo", params.grupo.trim());
  if (params.pagina) search.set("pagina", String(params.pagina));
  if (params.limite) search.set("limite", String(params.limite));

  const qs = search.toString();
  const res = await fetch(`/api/exercicios${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const erro =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: string }).error === "string"
        ? (body as { error: string }).error
        : "Erro ao carregar exercícios";
    throw new Error(erro);
  }

  return res.json() as Promise<ListarExerciciosResponse>;
}

export async function criarExercicioProfessor(dados: {
  nome: string;
  gifUrl?: string;
  grupoMuscular: string;
  subGrupoMuscular: string;
  series: number;
  repeticoes: number;
  descanso: number;
}): Promise<ExercicioCatalogo> {
  const res = await fetch("/api/professor/exercicios", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const erro =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: string }).error === "string"
        ? (body as { error: string }).error
        : "Erro ao criar exercício";
    throw new Error(erro);
  }

  return res.json() as Promise<ExercicioCatalogo>;
}

export async function listarExerciciosProfessor(busca?: string): Promise<ExercicioCatalogo[]> {
  const search = new URLSearchParams();
  if (busca?.trim()) search.set("busca", busca.trim());
  const qs = search.toString();

  const res = await fetch(`/api/professor/exercicios${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const erro =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: string }).error === "string"
        ? (body as { error: string }).error
        : "Erro ao carregar exercícios";
    throw new Error(erro);
  }

  const data = (await res.json()) as { itens: ExercicioCatalogo[] };
  return data.itens;
}
