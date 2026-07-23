import { planoVencido } from "@/lib/plano-vencimento";
import {
  modulosVigentes,
  normalizarModulos,
  parseModulosVencimentos,
  type ModulosVencimentos,
} from "@/lib/modulos-aluno";

export function alunoPlanoAtivo(params: {
  planoVenceEm?: string | null;
  modulosAtivos?: string[] | null;
  modulosVencimentos?: ModulosVencimentos | null;
}): boolean {
  if (params.modulosVencimentos && Object.keys(params.modulosVencimentos).length > 0) {
    return modulosVigentes(params.modulosVencimentos).length > 0;
  }
  if (planoVencido(params.planoVenceEm)) return false;
  return normalizarModulos(params.modulosAtivos ?? []).length > 0;
}

export function resolverModulosAtivosAluno(params: {
  modulosAtivos?: string[] | null;
  planoVenceEm?: string | Date | null;
  modulosVencimentos?: unknown;
}): string[] {
  const venc = parseModulosVencimentos(params.modulosVencimentos);
  if (Object.keys(venc).length > 0) {
    return modulosVigentes(venc);
  }
  if (planoVencido(params.planoVenceEm ?? null)) return [];
  return normalizarModulos(params.modulosAtivos ?? []);
}
