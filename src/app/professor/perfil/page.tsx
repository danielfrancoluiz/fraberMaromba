"use client";

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

      <RedefinirSenhaCard />
    </PerfilPageLayout>
  );
}
