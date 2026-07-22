"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { PerfilPageLayout } from "@/components/perfil/PerfilPageLayout";
import { RedefinirSenhaCard } from "@/components/auth/RedefinirSenhaCard";
import { HistoricoPagamentos } from "@/components/pagamento/HistoricoPagamentos";
import {
  resumoModulosAtivos,
  semPlanoContratado,
} from "@/components/pagamento/ContratarPlanoBanner";

const STATUS_LABELS: Record<string, string> = {
  ativo_professor: "Ativo (professor)",
  ativo_plataforma: "Ativo (plataforma)",
  inativo: "Inativo",
};

export default function Page() {
  const { data: session } = useSession();
  const nome = session?.user?.name ?? "Aluno";
  const email = session?.user?.email ?? "";
  const status = session?.user?.status ?? "inativo";
  const alunoId = session?.user?.alunoId ?? "";
  const modulos = session?.user?.modulosAtivos ?? [];
  const semPlano = semPlanoContratado({
    planoVenceEm: session?.user?.planoVenceEm,
    modulosAtivos: modulos,
  });

  return (
    <PerfilPageLayout nome={nome} email={email} badge="Aluno" badgeVariant="aluno">
      <div className="card perfil-dados-grid">
        <div>
          <p className="text-muted perfil-campo-label">Módulos</p>
          <p className="perfil-campo-valor">
            {semPlano ? "Nenhum" : resumoModulosAtivos(modulos)}
          </p>
        </div>
        <div>
          <p className="text-muted perfil-campo-label">Status</p>
          <p className="perfil-campo-valor">{STATUS_LABELS[status] ?? status}</p>
        </div>
      </div>

      <Link href="/aluno/planos" className="card" style={{ display: "block", textDecoration: "none" }}>
        <p className="perfil-campo-valor" style={{ margin: 0 }}>
          {semPlano || status === "inativo"
            ? "Contratar módulos"
            : "Alterar / renovar módulos"}
        </p>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
          {session?.user?.planoVenceEm
            ? `Válido até ${new Date(session.user.planoVenceEm).toLocaleDateString("pt-BR")}`
            : "1 módulo R$ 19,90 · 2 R$ 29,90 · 3 R$ 39,90 / mês"}
        </p>
      </Link>

      {alunoId ? <HistoricoPagamentos alunoId={alunoId} /> : null}

      <RedefinirSenhaCard />
    </PerfilPageLayout>
  );
}
