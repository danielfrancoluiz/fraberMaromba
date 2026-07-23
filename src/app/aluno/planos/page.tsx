"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { ModulosContratar } from "@/components/pagamento/ModulosContratar";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const alunoId = session?.user?.alunoId ?? "";

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Planos"
          subtitle="Contrate ou renove seus módulos mensais"
          onBack={() => router.push("/aluno/perfil")}
        />
        {alunoId ? (
          <ModulosContratar
            alunoId={alunoId}
            modulosAtuais={session?.user?.modulosAtivos ?? []}
            modulosVencimentos={session?.user?.modulosVencimentos ?? {}}
          />
        ) : (
          <p className="text-muted">
            Não foi possível identificar sua conta de aluno. Saia e entre
            novamente.
          </p>
        )}
      </div>
    </main>
  );
}
