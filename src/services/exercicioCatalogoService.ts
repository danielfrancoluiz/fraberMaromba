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
