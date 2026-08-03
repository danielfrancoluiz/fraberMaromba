import type { OfertaGrupo, OfertaPlano } from "@/lib/ofertas-planos";

export async function listarOfertasPlanos(params?: {
  grupo?: OfertaGrupo;
  /** Professor: inclui inativas. */
  todas?: boolean;
}): Promise<OfertaPlano[]> {
  const search = new URLSearchParams();
  if (params?.grupo) search.set("grupo", params.grupo);
  if (params?.todas) search.set("todas", "1");

  const qs = search.toString();
  const res = await fetch(`/api/ofertas${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const erro =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: string }).error === "string"
        ? (body as { error: string }).error
        : "Não foi possível carregar as ofertas";
    throw new Error(erro);
  }

  return Array.isArray(body) ? (body as OfertaPlano[]) : [];
}
