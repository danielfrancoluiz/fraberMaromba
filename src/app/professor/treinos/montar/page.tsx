"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MontarTreinoBuilder } from "@/components/professor/MontarTreinoBuilder";

function MontarTreinoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alunoId = searchParams.get("alunoId") ?? undefined;

  return (
    <MontarTreinoBuilder
      alunoIdInicial={alunoId}
      alunoIdFixo={Boolean(alunoId)}
      onCancelar={() => {
        if (alunoId) {
          router.push(`/professor/alunos/${alunoId}`);
        } else {
          router.push("/professor/treinos");
        }
      }}
      onSucesso={() => {
        if (alunoId) {
          router.push(`/professor/alunos/${alunoId}`);
        } else {
          router.push("/professor/treinos");
        }
      }}
    />
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="page-main">
          <p className="text-muted" style={{ textAlign: "center", marginTop: "3rem" }}>
            Carregando...
          </p>
        </main>
      }
    >
      <MontarTreinoPageContent />
    </Suspense>
  );
}
