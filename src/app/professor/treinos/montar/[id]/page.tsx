"use client";

import { useParams, useRouter } from "next/navigation";
import { MontarTreinoBuilder } from "@/components/professor/MontarTreinoBuilder";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const treinoId = params.id;

  return (
    <MontarTreinoBuilder
      treinoId={treinoId}
      alunoIdFixo
      onCancelar={() => router.back()}
      onSucesso={() => router.back()}
    />
  );
}
