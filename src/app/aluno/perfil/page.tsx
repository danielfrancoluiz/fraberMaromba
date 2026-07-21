"use client";

import { useSession } from "next-auth/react";
import { PerfilPageLayout } from "@/components/perfil/PerfilPageLayout";
import { RedefinirSenhaCard } from "@/components/auth/RedefinirSenhaCard";
import { PlanoStatus } from "@/components/aluno/PlanoStatus";
import { HistoricoPagamentos } from "@/components/pagamento/HistoricoPagamentos";
import { labelPlano } from "@/lib/planos-pagamento";

const STATUS_LABELS: Record<string, string> = {
  ativo_professor: "Ativo (professor)",
  ativo_plataforma: "Ativo (plataforma)",
  inativo: "Inativo",
};

export default function Page() {
  const { data: session } = useSession();
  const nome = session?.user?.name ?? "Aluno";
  const email = session?.user?.email ?? "";
  const planoId = session?.user?.planoId ?? "mensal";
  const status = session?.user?.status ?? "inativo";
  const alunoId = session?.user?.alunoId ?? "";

  return (
    <PerfilPageLayout nome={nome} email={email} badge="Aluno" badgeVariant="aluno">
      <div className="card perfil-dados-grid">
        <div>
          <p className="text-muted perfil-campo-label">Plano</p>
          <p className="perfil-campo-valor">{labelPlano(planoId)}</p>
        </div>
        <div>
          <p className="text-muted perfil-campo-label">Status</p>
          <p className="perfil-campo-valor">{STATUS_LABELS[status] ?? status}</p>
        </div>
      </div>

      <PlanoStatus
        alunoId={alunoId}
        planoId={planoId}
        status={status}
        mostrarPagamento={status === "inativo"}
      />

      {alunoId ? <HistoricoPagamentos alunoId={alunoId} /> : null}

      <RedefinirSenhaCard />
    </PerfilPageLayout>
  );
}
