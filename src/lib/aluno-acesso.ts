import { planoVencido } from "@/lib/plano-vencimento";
import { normalizarModulos } from "@/lib/modulos-aluno";

export function alunoPlanoAtivo(params: {
  planoVenceEm?: string | null;
  modulosAtivos?: string[] | null;
}): boolean {
  if (planoVencido(params.planoVenceEm)) return false;
  return normalizarModulos(params.modulosAtivos ?? []).length > 0;
}
