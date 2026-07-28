import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { planoVencido } from "@/lib/plano-vencimento";
import { moduloVigente, type ModuloAlunoId } from "@/lib/modulos-aluno";

type TokenModulos = {
  planoVenceEm?: string;
  modulosAtivos?: ModuloAlunoId[] | string[];
  modulosVencimentos?: Partial<Record<ModuloAlunoId, string>>;
};

function tokenTemPlanoPago(token: TokenModulos): boolean {
  const venc = token.modulosVencimentos;
  if (venc && Object.keys(venc).length > 0) {
    return (Object.keys(venc) as ModuloAlunoId[]).some((id) =>
      moduloVigente(venc[id])
    );
  }
  if (planoVencido(token.planoVenceEm)) return false;
  return (token.modulosAtivos?.length ?? 0) > 0;
}

function tokenTemModulo(token: TokenModulos, modulo: ModuloAlunoId): boolean {
  const venc = token.modulosVencimentos;
  // Com mapa de vencimentos, só o módulo explicitamente vigente libera.
  // (Antes, ter musculação fazia o fallback liberar corrida via array antigo no JWT.)
  if (venc && Object.keys(venc).length > 0) {
    return moduloVigente(venc[modulo]);
  }
  if (!tokenTemPlanoPago(token)) return false;
  return (token.modulosAtivos ?? []).includes(modulo);
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/professor")) {
      if (token?.role !== "professor") {
        return NextResponse.redirect(new URL("/acesso-negado", req.url));
      }
    }

    if (pathname.startsWith("/aluno")) {
      if (token?.role !== "aluno") {
        return NextResponse.redirect(new URL("/acesso-negado", req.url));
      }

      const livres = [
        "/aluno/dashboard",
        "/aluno/planos",
        "/aluno/perfil",
        "/aluno/nutricao",
        "/aluno/corrida",
        "/aluno/inativo",
        "/aluno/modulo-bloqueado",
        "/aluno/login",
      ];
      const caminhoLivre = livres.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );

      if (!caminhoLivre) {
        if (!tokenTemPlanoPago(token ?? {})) {
          return NextResponse.redirect(new URL("/aluno/planos", req.url));
        }

        if (
          pathname.startsWith("/aluno/treinos") ||
          pathname.startsWith("/aluno/treino")
        ) {
          if (!tokenTemModulo(token ?? {}, "musculacao")) {
            return NextResponse.redirect(
              new URL("/aluno/modulo-bloqueado?m=musculacao", req.url)
            );
          }
        }

        // Corrida e nutrição: a própria página mostra contratar ou conteúdo.
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/professor/:path*", "/aluno/:path*"],
};
