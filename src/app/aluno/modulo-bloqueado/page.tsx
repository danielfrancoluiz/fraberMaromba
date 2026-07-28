"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { LockKeyhole } from "lucide-react";
import {
  isModuloAlunoId,
  labelModulo,
  moduloVigente,
  type ModuloAlunoId,
} from "@/lib/modulos-aluno";
import { atualizarSessaoComTimeout } from "@/lib/atualizar-sessao";

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
  const venc = user.modulosVencimentos?.[modulo];
  if (typeof venc === "string" && moduloVigente(venc)) return true;
  return (user.modulosAtivos ?? []).includes(modulo);
}

function Conteudo() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, update, status } = useSession();

  const m = params.get("m") ?? "";
  const modulo: ModuloAlunoId | null = isModuloAlunoId(m) ? m : null;
  const nome = modulo ? labelModulo(modulo) : "este módulo";

  // Se o aluno já tem o módulo (ex.: acabou de pagar), redireciona.
  useEffect(() => {
    if (!modulo || status === "loading") return;
    if (temAcessoModulo(modulo, session?.user)) {
      router.replace(destinoModulo(modulo));
    }
  }, [modulo, status, session?.user, router]);

  // Atualiza a sessão em segundo plano — sem travar a UI.
  useEffect(() => {
    if (!modulo || status === "loading") return;
    let cancelado = false;

    void (async () => {
      const sessao = (await atualizarSessaoComTimeout(() => update())) as {
        user?: {
          modulosAtivos?: string[];
          modulosVencimentos?: Partial<Record<string, string>>;
        };
      } | null;
      if (cancelado || !sessao?.user) return;
      if (temAcessoModulo(modulo, sessao.user)) {
        router.replace(destinoModulo(modulo));
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [modulo, status, update, router]);

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
          <Link href="/aluno/nutricao" className="btn-secondary">
            Ir para Nutrição
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
