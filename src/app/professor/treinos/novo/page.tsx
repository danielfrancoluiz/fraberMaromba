"use client";

import { useRouter } from "next/navigation";
import { CriarTemplateForm } from "@/components/professor/CriarTemplateForm";

export default function Page() {
  const router = useRouter();

  return (
    <CriarTemplateForm
      onCancelar={() => router.push("/professor/treinos")}
      onSucesso={() => router.push("/professor/treinos")}
    />
  );
}
