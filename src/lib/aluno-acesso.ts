import { planoVencido } from "@/lib/plano-vencimento";
import {
  moduloVigente,
  modulosVigentes,
  normalizarModulos,
  parseModulosVencimentos,
  type ModuloAlunoId,
  type ModulosVencimentos,
} from "@/lib/modulos-aluno";

export type AcessoAluno = {
  planoVenceEm?: string | null;
  modulosAtivos?: string[] | null;
  modulosVencimentos?: ModulosVencimentos | Partial<Record<string, string>> | null;
};

export function alunoPlanoAtivo(params: AcessoAluno): boolean {
  if (
    params.modulosVencimentos &&
    Object.keys(params.modulosVencimentos).length > 0
  ) {
    return modulosVigentes(params.modulosVencimentos).length > 0;
  }
  if (planoVencido(params.planoVenceEm)) return false;
  return normalizarModulos(params.modulosAtivos ?? []).length > 0;
}

export function resolverModulosAtivosAluno(params: {
  modulosAtivos?: string[] | null;
  planoVenceEm?: string | Date | null;
  modulosVencimentos?: unknown;
}): ModuloAlunoId[] {
  const venc = parseModulosVencimentos(params.modulosVencimentos);
  if (Object.keys(venc).length > 0) {
    return modulosVigentes(venc);
  }
  if (planoVencido(params.planoVenceEm ?? null)) return [];
  return normalizarModulos(params.modulosAtivos ?? []);
}

/**
 * Fonte única: o aluno tem o módulo vigente?
 * - Com mapa de vencimentos → só o módulo vigente libera.
 * - Sem mapa → usa array + planoVenceEm legado.
 */
export function alunoTemModulo(
  acesso: AcessoAluno | null | undefined,
  modulo: ModuloAlunoId
): boolean {
  if (!acesso) return false;

  const venc = acesso.modulosVencimentos;
  if (venc && Object.keys(venc).length > 0) {
    return moduloVigente(venc[modulo as keyof typeof venc]);
  }

  if (planoVencido(acesso.planoVenceEm)) return false;
  return normalizarModulos(acesso.modulosAtivos ?? []).includes(modulo);
}

/**
 * Rotas de conteúdo protegido (não a listagem/contratar).
 * `/aluno/treinos`, `/aluno/corrida`, `/aluno/nutricao` ficam livres na UI
 * para mostrar "contratar"; o treino individual exige musculação.
 */
export function moduloExigidoPelaRotaAluno(
  pathname: string
): ModuloAlunoId | null {
  // Cuidado: `/aluno/treinos` NÃO pode casar com prefixo `/aluno/treino`.
  if (pathname.startsWith("/aluno/treino/") || pathname === "/aluno/treino") {
    return "musculacao";
  }
  return null;
}

/** Middleware / guards: pode seguir nesta rota com o token atual? */
export function podeAcessarRotaAluno(
  pathname: string,
  acesso: AcessoAluno | null | undefined
): boolean {
  const exigido = moduloExigidoPelaRotaAluno(pathname);
  if (!exigido) return true;
  return alunoTemModulo(acesso, exigido);
}

/** Href do rodapé / tiles: listagem do módulo (sempre a rota do módulo). */
export function hrefListagemModulo(modulo: ModuloAlunoId): string {
  if (modulo === "musculacao") return "/aluno/treinos";
  if (modulo === "corrida") return "/aluno/corrida";
  return "/aluno/nutricao";
}

export function destinoBloqueioModulo(modulo: ModuloAlunoId): string {
  return `/aluno/modulo-bloqueado?m=${modulo}`;
}
