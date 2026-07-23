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
  const venceEm = token.modulosVencimentos?.[modulo];
  if (venceEm) {
    return moduloVigente(venceEm);
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
        "/aluno/planos",
        "/aluno/perfil",
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

        if (pathname.startsWith("/aluno/corrida")) {
          if (!tokenTemModulo(token ?? {}, "corrida")) {
            return NextResponse.redirect(
              new URL("/aluno/modulo-bloqueado?m=corrida", req.url)
            );
          }
        }

        if (pathname.startsWith("/aluno/nutricao")) {
          if (!tokenTemModulo(token ?? {}, "nutricao")) {
            return NextResponse.redirect(
              new URL("/aluno/modulo-bloqueado?m=nutricao", req.url)
            );
          }
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
