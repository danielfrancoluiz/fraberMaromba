"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Page() {
  return (
    <main className="page-main inativo-page">
      <div className="inativo-page-inner card">
        <LockKeyhole size={64} className="text-accent" aria-hidden />

        <h1>Conta inativa</h1>

        <p className="text-muted">
          Sua conta está inativa. Para acessar seus treinos, assine um plano da
          plataforma ou fale com seu professor.
        </p>

        <div className="inativo-page-acoes">
          <Link href="/aluno/planos" className="btn-primary">
            Ver planos e contratar
          </Link>

          <Link href="/aluno/perfil" className="btn-secondary">
            Ir para o perfil
          </Link>

          <a href="mailto:contato@fraber.com" className="btn-secondary">
            Falar com suporte
          </a>

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
