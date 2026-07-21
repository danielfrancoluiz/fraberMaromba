"use client";

import { PlanoDashboardBanners } from "@/components/pagamento/PlanoDashboardBanners";
import { AlunoHome360 } from "@/components/aluno/AlunoHome360";

export default function Page() {
  return (
    <main className="page-main student-page-main">
      <div className="page-container page-stack">
        <PlanoDashboardBanners
          hrefPlanos="/aluno/planos"
          hrefPerfil="/aluno/perfil"
        />
        <AlunoHome360 />
      </div>
    </main>
  );
}
