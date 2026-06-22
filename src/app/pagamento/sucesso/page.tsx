"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { CheckCircle, Loader2 } from "lucide-react";

function PagamentoSucessoConteudo() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [confirmando, setConfirmando] = useState(!!sessionId);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let ativo = true;

    async function confirmar() {
      try {
        const res = await fetch("/api/pagamentos/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
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
        }
      } catch {
        if (ativo) {
          setErro(
            "Não foi possível confirmar o pagamento. Saia e entre de novo em alguns instantes."
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
  }, [sessionId]);

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
            : "Seu plano foi registrado. Saia e entre novamente para atualizar a sessão."}
        </p>
        {erro ? <p className="erro-campo">{erro}</p> : null}
        <div className="action-row" style={{ width: "100%", marginTop: "8px" }}>
          <Link href="/aluno/dashboard" className="btn-primary">
            Ir para o dashboard
          </Link>
          <Link href="/aluno/perfil" className="btn-secondary">
            Ver perfil
          </Link>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            Sair e entrar de novo
          </button>
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
