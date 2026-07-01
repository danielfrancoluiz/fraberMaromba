"use client";

import { useSession } from "next-auth/react";
import { AlunoHome360 } from "@/components/aluno/AlunoHome360";
import { PlanoStatus } from "@/components/aluno/PlanoStatus";

export default function Page() {
  const { data: session } = useSession();

  return (
    <main className="page-main student-page-main">
      <div className="page-container">
        {session?.user?.status === "inativo" ? (
          <PlanoStatus
            alunoId={session?.user?.alunoId ?? ""}
            planoId={session?.user?.planoId ?? "mensal"}
            status={session?.user?.status ?? "inativo"}
            mostrarPagamento
          />
        ) : null}
        <AlunoHome360 />
      </div>
    </main>
  );
}
