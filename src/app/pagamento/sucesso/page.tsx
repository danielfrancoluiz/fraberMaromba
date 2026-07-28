"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle, Loader2 } from "lucide-react";
import { finalizarPosPagamentoAluno } from "@/lib/pos-pagamento-cliente";

function PagamentoSucessoConteudo() {
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const paymentIntentId = searchParams.get("payment_intent");
  const ok = searchParams.get("ok") === "1";
  const roleParam = searchParams.get("role");
  const role =
    roleParam === "professor" || roleParam === "aluno"
      ? roleParam
      : session?.user?.role === "professor"
        ? "professor"
        : "aluno";

  const [confirmando, setConfirmando] = useState(Boolean(paymentIntentId) && !ok);
  const [erro, setErro] = useState<string | null>(null);
  const [destino, setDestino] = useState(
    role === "professor" ? "/professor/dashboard" : "/aluno/dashboard"
  );
  const jaRodou = useRef(false);

  useEffect(() => {
    if (jaRodou.current) return;
    jaRodou.current = true;

    let ativo = true;

    async function rodar() {
      if (ok) {
        try {
          await update({ syncFromDb: true });
        } catch {
          /* ignore */
        }
        return;
      }

      if (!paymentIntentId) return;

      try {
        if (role === "professor") {
          await update({ syncFromDb: true });
          if (ativo) {
            setDestino("/professor/dashboard");
            setConfirmando(false);
          }
          return;
        }

        const url = await finalizarPosPagamentoAluno({
          paymentIntentId,
          update,
          navegar: true,
        });
        if (ativo) setDestino(url);
      } catch {
        if (ativo) {
          setErro(
            "Não foi possível confirmar o pagamento. Atualize a página em alguns instantes."
          );
        }
      } finally {
        if (ativo) setConfirmando(false);
      }
    }

    void rodar();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma vez só
  }, []);

  const dashHref =
    role === "professor" ? "/professor/dashboard" : destino;
  const perfilHref =
    role === "professor" ? "/professor/perfil" : "/aluno/perfil";

  return (
    <main className="status-page">
      <div className="status-page-inner">
        {confirmando ? (
          <Loader2
            size={48}
            style={{ color: "var(--fraber-accent)" }}
            aria-hidden
          />
        ) : (
          <CheckCircle
            size={64}
            style={{ color: "var(--fraber-success)" }}
            aria-hidden
          />
        )}
        <h1>Pagamento confirmado</h1>
        <p className="text-muted">
          {confirmando
            ? "Confirmando seu pagamento..."
            : "Seu plano foi registrado e já está ativo."}
        </p>
        {erro ? <p className="erro-campo">{erro}</p> : null}
        <div className="action-row" style={{ width: "100%", marginTop: "8px" }}>
          <Link href={dashHref} className="btn-primary">
            Continuar
          </Link>
          <Link href={perfilHref} className="btn-secondary">
            Ver perfil
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
        <main className="status-page">
          <div className="status-page-inner">
            <Loader2 size={48} aria-hidden />
            <p className="text-muted">Carregando...</p>
          </div>
        </main>
      }
    >
      <PagamentoSucessoConteudo />
    </Suspense>
  );
}
