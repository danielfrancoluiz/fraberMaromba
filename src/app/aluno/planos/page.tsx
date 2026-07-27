"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { OfertasContratar } from "@/components/pagamento/OfertasContratar";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const alunoId = session?.user?.alunoId ?? "";

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Planos"
          subtitle="Contrate ou renove seus módulos de treino"
          onBack={() => router.push("/aluno/perfil")}
        />
        {alunoId ? (
          <OfertasContratar
            alunoId={alunoId}
            grupo="treino"
            titulo="Treino — mês promocional"
            subtitulo="Musculação R$ 49 · Corrida R$ 29 · Combo R$ 69"
            modulosAtuais={session?.user?.modulosAtivos ?? []}
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
