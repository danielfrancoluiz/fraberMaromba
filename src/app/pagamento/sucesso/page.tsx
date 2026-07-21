"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle, Loader2 } from "lucide-react";

function PagamentoSucessoConteudo() {
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");
  const ok = searchParams.get("ok") === "1";
  const roleParam = searchParams.get("role");
  const role =
    roleParam === "professor" || roleParam === "aluno"
      ? roleParam
      : session?.user?.role === "professor"
        ? "professor"
        : "aluno";

  const [confirmando, setConfirmando] = useState(
    Boolean(sessionId || paymentIntentId) && !ok
  );
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (ok) {
      void update();
      return;
    }

    const idCheckout = sessionId;
    const idIntent = paymentIntentId;
    if (!idCheckout && !idIntent) return;

    let ativo = true;

    async function confirmar() {
      try {
        const payload = idIntent
          ? { paymentIntentId: idIntent }
          : { sessionId: idCheckout };

        const res = await fetch("/api/pagamentos/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!ativo) return;

        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const msg =
            typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof (body as { error: string }).error === "string"
              ? (body as { error: string }).error
              : "Não foi possível confirmar o pagamento automaticamente.";
          setErro(msg);
        } else {
          await update();
        }
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

    void confirmar();

    return () => {
      ativo = false;
    };
  }, [sessionId, paymentIntentId, ok, update]);

  const dashHref =
    role === "professor" ? "/professor/dashboard" : "/aluno/dashboard";
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
            Ir para o dashboard
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
