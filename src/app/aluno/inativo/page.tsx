"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Page() {
  return (
    <main className="page-main inativo-page">
      <div className="inativo-page-inner card">
        <LockKeyhole size={64} className="text-accent" aria-hidden />

        <h1>Acesso bloqueado</h1>

        <p className="text-muted">
          Para usar Musculação, Corrida e Nutrição, contrate os módulos
          mensais. Sem pagamento ativo, essas áreas ficam bloqueadas.
        </p>

        <div className="inativo-page-acoes">
          <Link href="/aluno/planos" className="btn-primary">
            Contratar módulos
          </Link>

          <Link href="/aluno/perfil" className="btn-secondary">
            Ir para o perfil
          </Link>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            Sair
          </button>
        </div>
      </div>
    </main>
  );
}
