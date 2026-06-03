"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { CheckCircle } from "lucide-react";

export default function Page() {
  return (
    <main className="page-main pagamento-resultado">
      <CheckCircle size={64} className="pagamento-resultado-icon" aria-hidden />
      <h1>Pagamento confirmado</h1>
      <p className="text-muted pagamento-resultado-texto">
        Seu plano foi registrado. Se o acesso ainda não liberar, saia e entre
        novamente para atualizar a sessão.
      </p>
      <div className="pagamento-resultado-acoes">
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
    </main>
  );
}
