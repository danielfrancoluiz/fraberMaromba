import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Rotas do professor: apenas role professor
    if (pathname.startsWith("/professor")) {
      if (token?.role !== "professor") {
        return NextResponse.redirect(new URL("/acesso-negado", req.url));
      }
    }

    // Rotas do aluno: apenas role aluno
    if (pathname.startsWith("/aluno")) {
      if (token?.role !== "aluno") {
        return NextResponse.redirect(new URL("/acesso-negado", req.url));
      }
      // Aluno inativo: bloqueia acesso a treinos
      if (
        pathname.startsWith("/aluno/treino") ||
        pathname.startsWith("/aluno/dashboard") ||
        pathname.startsWith("/aluno/treinos")
      ) {
        if (
          token?.status !== "ativo_professor" &&
          token?.status !== "ativo_plataforma"
        ) {
          return NextResponse.redirect(new URL("/aluno/inativo", req.url));
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
