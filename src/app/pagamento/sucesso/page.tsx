"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { CheckCircle } from "lucide-react";

export default function Page() {
  return (
    <main className="status-page">
      <div className="status-page-inner">
        <CheckCircle size={64} style={{ color: "var(--fraber-success)" }} aria-hidden />
        <h1>Pagamento confirmado</h1>
        <p className="text-muted">
          Seu plano foi registrado. Se o acesso ainda não liberar, saia e entre
          novamente para atualizar a sessão.
        </p>
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
