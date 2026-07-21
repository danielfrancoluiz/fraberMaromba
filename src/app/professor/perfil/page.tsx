"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { PerfilPageLayout } from "@/components/perfil/PerfilPageLayout";
import { RedefinirSenhaCard } from "@/components/auth/RedefinirSenhaCard";

export default function Page() {
  const { data: session } = useSession();
  const nome = session?.user?.name ?? "Professor";
  const email = session?.user?.email ?? "";

  return (
    <PerfilPageLayout
      nome={nome}
      email={email}
      badge="Personal Trainer"
      badgeVariant="professor"
    >
      <div className="card perfil-dados-grid">
        <div>
          <p className="text-muted perfil-campo-label">E-mail</p>
          <p className="perfil-campo-valor">{email}</p>
        </div>
        <div>
          <p className="text-muted perfil-campo-label">Função</p>
          <p className="perfil-campo-valor">Professor</p>
        </div>
      </div>

      <Link href="/professor/planos" className="card" style={{ display: "block", textDecoration: "none" }}>
        <p className="perfil-campo-valor" style={{ margin: 0 }}>
          Planos e preços
        </p>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
          Atualize os valores cobrados no Stripe
        </p>
      </Link>

      <RedefinirSenhaCard />
    </PerfilPageLayout>
  );
}
