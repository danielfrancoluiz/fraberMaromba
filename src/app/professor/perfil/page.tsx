"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { PerfilPageLayout } from "@/components/perfil/PerfilPageLayout";
import { RedefinirSenhaCard } from "@/components/auth/RedefinirSenhaCard";
import { labelPlano } from "@/lib/planos-pagamento";
import { semPlanoContratado } from "@/components/pagamento/ContratarPlanoBanner";

export default function Page() {
  const { data: session } = useSession();
  const nome = session?.user?.name ?? "Professor";
  const email = session?.user?.email ?? "";
  const planoId = session?.user?.planoId;

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
          <p className="text-muted perfil-campo-label">Plano</p>
          <p className="perfil-campo-valor">
            {semPlanoContratado(planoId) ? "Nenhum" : labelPlano(planoId!)}
          </p>
        </div>
      </div>

      <Link href="/professor/planos" className="card" style={{ display: "block", textDecoration: "none" }}>
        <p className="perfil-campo-valor" style={{ margin: 0 }}>
          {semPlanoContratado(planoId) ? "Contratar plano" : "Alterar / renovar plano"}
        </p>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
          {session?.user?.planoVenceEm
            ? `Válido até ${new Date(session.user.planoVenceEm).toLocaleDateString("pt-BR")}`
            : "Assinatura da plataforma Fraber"}
        </p>
      </Link>

      <RedefinirSenhaCard />
    </PerfilPageLayout>
  );
}
