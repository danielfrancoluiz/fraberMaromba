"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { LockKeyhole, Loader2 } from "lucide-react";
import {
  isModuloAlunoId,
  labelModulo,
  moduloVigente,
  type ModuloAlunoId,
} from "@/lib/modulos-aluno";
import { atualizarSessaoComTimeout } from "@/lib/atualizar-sessao";

function Conteudo() {
  const params = useSearchParams();
  const router = useRouter();
  const { update, status } = useSession();
  const [sincronizando, setSincronizando] = useState(true);
  const jaRodou = useRef(false);

  const m = params.get("m") ?? "";
  const modulo: ModuloAlunoId | null = isModuloAlunoId(m) ? m : null;
  const nome = modulo ? labelModulo(modulo) : "este módulo";

  useEffect(() => {
    if (status === "loading") return;
    if (jaRodou.current) return;
    jaRodou.current = true;

    let ativo = true;

    async function sincronizar() {
      try {
        const sessao = (await atualizarSessaoComTimeout(() => update())) as {
          user?: {
            modulosAtivos?: string[];
            modulosVencimentos?: Partial<Record<string, string>>;
          };
        } | null;
        if (!ativo || !modulo) return;

        const venc = sessao?.user?.modulosVencimentos?.[modulo];
        const ativos = sessao?.user?.modulosAtivos ?? [];
        const liberado =
          (typeof venc === "string" && moduloVigente(venc)) ||
          ativos.includes(modulo);

        if (liberado) {
          const destino =
            modulo === "musculacao"
              ? "/aluno/treinos"
              : modulo === "corrida"
                ? "/aluno/corrida"
                : "/aluno/nutricao";
          router.replace(destino);
          return;
        }
      } finally {
        if (ativo) setSincronizando(false);
      }
    }

    void sincronizar();

    return () => {
      ativo = false;
    };
  }, [status, update, modulo, router]);

  if (sincronizando) {
    return (
      <main className="page-main inativo-page">
        <div className="inativo-page-inner card">
          <Loader2 size={48} className="text-accent" aria-hidden />
          <h1>Verificando acesso...</h1>
          <p className="text-muted">Atualizando seus módulos contratados.</p>
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
        <main className="page-main">
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <Conteudo />
    </Suspense>
  );
}
