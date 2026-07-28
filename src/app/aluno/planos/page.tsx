"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { OfertasContratar } from "@/components/pagamento/OfertasContratar";
import { atualizarSessaoComTimeout } from "@/lib/atualizar-sessao";

export default function Page() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const alunoId = session?.user?.alunoId ?? "";

  useEffect(() => {
    void atualizarSessaoComTimeout(() => update(), 8000);
  }, [update]);

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Planos"
          subtitle="Contrate ou renove seus módulos de treino"
          onBack={() => router.push("/aluno/dashboard")}
        />
        {alunoId ? (
          <OfertasContratar
            alunoId={alunoId}
            grupo="treino"
            titulo="Contratar treino"
            modulosAtuais={session?.user?.modulosAtivos ?? []}
            modulosVencimentos={session?.user?.modulosVencimentos ?? null}
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
