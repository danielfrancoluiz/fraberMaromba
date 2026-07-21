"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { PlanosContratar } from "@/components/pagamento/PlanosContratar";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const alunoId = session?.user?.alunoId ?? "";

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Planos"
          subtitle="Contrate ou renove sua assinatura"
          onBack={() => router.push("/aluno/dashboard")}
        />
        <PlanosContratar
          alunoId={alunoId || undefined}
          planoAtualId={session?.user?.planoId}
          titulo="Planos para alunos"
          subtitulo="Escolha o plano que faz sentido para você. Após o pagamento, saia e entre de novo para atualizar o acesso."
        />
      </div>
    </main>
  );
}
