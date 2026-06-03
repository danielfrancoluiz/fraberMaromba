"use client";

import type { ReactNode } from "react";
import { AvatarIniciais } from "@/components/AvatarIniciais";
import { LogoutButton } from "@/components/LogoutButton";

interface PerfilPageLayoutProps {
  titulo?: string;
  nome: string;
  email: string;
  badge: string;
  badgeVariant?: "aluno" | "professor";
  children?: ReactNode;
}

export function PerfilPageLayout({
  titulo = "Perfil",
  nome,
  email,
  badge,
  badgeVariant = "aluno",
  children,
}: PerfilPageLayoutProps) {
  return (
    <main className="page-main">
      <div className="page-container perfil-page">
        <header className="perfil-page-header">
          <h1>{titulo}</h1>
        </header>

        <div className="card perfil-hero">
          <AvatarIniciais nome={nome} size="lg" />
          <div className="perfil-hero-info">
            <p className="perfil-hero-nome">{nome}</p>
            <p className="text-muted perfil-hero-email">{email}</p>
            <span className={`perfil-badge perfil-badge--${badgeVariant}`}>
              {badge}
            </span>
          </div>
        </div>

        {children}

        <LogoutButton fullWidth />
      </div>
    </main>
  );
}
