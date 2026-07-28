"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { LockKeyhole, Loader2 } from "lucide-react";
import {
  isModuloAlunoId,
  labelModulo,
  moduloVigente,
  type ModuloAlunoId,
} from "@/lib/modulos-aluno";

function destinoModulo(modulo: ModuloAlunoId): string {
  if (modulo === "musculacao") return "/aluno/treinos";
  if (modulo === "corrida") return "/aluno/corrida";
  return "/aluno/nutricao";
}

function temAcessoModulo(
  modulo: ModuloAlunoId,
  user:
    | {
        modulosAtivos?: string[];
        modulosVencimentos?: Partial<Record<string, string>>;
      }
    | undefined
): boolean {
  if (!user) return false;
  const vencMap = user.modulosVencimentos;
  if (vencMap && Object.keys(vencMap).length > 0) {
    return moduloVigente(vencMap[modulo]);
  }
  return (user.modulosAtivos ?? []).includes(modulo);
}

function Conteudo() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [verificando, setVerificando] = useState(true);

  const m = params.get("m") ?? "";
  const modulo: ModuloAlunoId | null = isModuloAlunoId(m) ? m : null;
  const nome = modulo ? labelModulo(modulo) : "este módulo";

  useEffect(() => {
    if (!modulo || status === "loading") return;
    let cancelado = false;

    async function sincronizarDoBanco() {
      try {
        // 1) Se a sessão já tem o módulo, libera.
        if (temAcessoModulo(modulo!, session?.user)) {
          if (!cancelado) router.replace(destinoModulo(modulo!));
          return;
        }

        // 2) Lê o banco e atualiza o JWT (corrige sessão atrasada pós-pagamento).
        const res = await fetch("/api/aluno/acesso", { credentials: "include" });
        if (!res.ok) return;
        const body = (await res.json()) as {
          modulosAtivos?: string[];
          modulosVencimentos?: Partial<Record<string, string>>;
          planoVenceEm?: string | null;
          planoId?: string | null;
          status?: string;
        };

        await update({
          modulosAtivos: body.modulosAtivos,
          modulosVencimentos: body.modulosVencimentos,
          planoVenceEm: body.planoVenceEm,
          planoId: body.planoId,
          status: body.status,
        });

        if (
          !cancelado &&
          temAcessoModulo(modulo!, {
            modulosAtivos: body.modulosAtivos,
            modulosVencimentos: body.modulosVencimentos,
          })
        ) {
          router.replace(destinoModulo(modulo!));
          return;
        }
      } catch {
        /* mostra tela de bloqueio */
      } finally {
        if (!cancelado) setVerificando(false);
      }
    }

    void sincronizarDoBanco();

    return () => {
      cancelado = true;
    };
  }, [modulo, status, session?.user, update, router]);

  if (verificando || status === "loading") {
    return (
      <main className="page-main inativo-page">
        <div className="inativo-page-inner card">
          <Loader2 size={40} className="text-accent" aria-hidden />
          <p className="text-muted">Verificando acesso...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main inativo-page">
      <div className="inativo-page-inner card">
        <LockKeyhole size={64} className="text-accent" aria-hidden />
        <h1>Módulo não contratado</h1>
        <p className="text-muted">
          Você não tem acesso a <strong>{nome}</strong> no plano atual. Contrate
          este módulo (ou um pacote com mais opções) para liberar novamente.
        </p>
        <div className="inativo-page-acoes">
          <Link href="/aluno/planos" className="btn-primary">
            Contratar módulos
          </Link>
          <Link href="/aluno/dashboard" className="btn-secondary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="page-main inativo-page">
          <div className="inativo-page-inner card">
            <p className="text-muted">Carregando...</p>
          </div>
        </main>
      }
    >
      <Conteudo />
    </Suspense>
  );
}
