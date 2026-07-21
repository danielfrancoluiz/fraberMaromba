"use client";

import { useSession } from "next-auth/react";
import { AlunoHome360 } from "@/components/aluno/AlunoHome360";
import {
  ContratarPlanoBanner,
  semPlanoContratado,
} from "@/components/pagamento/ContratarPlanoBanner";

export default function Page() {
  const { data: session } = useSession();
  const precisaPlano =
    session?.user?.status === "inativo" ||
    semPlanoContratado(session?.user?.planoId);

  return (
    <main className="page-main student-page-main">
      <div className="page-container page-stack">
        {precisaPlano ? (
          <ContratarPlanoBanner
            href="/aluno/planos"
            titulo="Contrate um plano"
            descricao="Escolha um plano para liberar treinos e recursos da plataforma."
          />
        ) : null}
        <AlunoHome360 />
      </div>
    </main>
  );
}
