import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import {
  alunoTemModulo,
  destinoBloqueioModulo,
  moduloExigidoPelaRotaAluno,
  podeAcessarRotaAluno,
  type AcessoAluno,
} from "@/lib/aluno-acesso";

function tokenComoAcesso(token: Record<string, unknown> | null): AcessoAluno {
  if (!token) return {};
  return {
    planoVenceEm:
      typeof token.planoVenceEm === "string" ? token.planoVenceEm : undefined,
    modulosAtivos: Array.isArray(token.modulosAtivos)
      ? (token.modulosAtivos as string[])
      : undefined,
    modulosVencimentos:
      token.modulosVencimentos &&
      typeof token.modulosVencimentos === "object"
        ? (token.modulosVencimentos as AcessoAluno["modulosVencimentos"])
        : undefined,
  };
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as Record<string, unknown> | null;
    const pathname = req.nextUrl.pathname;
    const acesso = tokenComoAcesso(token);

    if (pathname.startsWith("/professor")) {
      if (token?.role !== "professor") {
        return NextResponse.redirect(new URL("/acesso-negado", req.url));
      }
    }

    if (pathname.startsWith("/aluno")) {
      if (token?.role !== "aluno") {
        return NextResponse.redirect(new URL("/acesso-negado", req.url));
      }

      // Listagens ficam livres (UI mostra contratar). /aluno/treino/[id] exige módulo.
      if (!podeAcessarRotaAluno(pathname, acesso)) {
        const modulo = moduloExigidoPelaRotaAluno(pathname)!;
        if (!alunoTemModulo(acesso, modulo)) {
          return NextResponse.redirect(
            new URL(destinoBloqueioModulo(modulo), req.url)
          );
        }
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
