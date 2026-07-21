"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { PlanosContratar } from "@/components/pagamento/PlanosContratar";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Planos"
          subtitle="Assinatura da plataforma Fraber"
          onBack={() => router.push("/professor/dashboard")}
        />
        <PlanosContratar
          planoAtualId={session?.user?.planoId}
          titulo="Planos para professores"
          subtitulo="Contrate o plano da plataforma e pague com cartão nesta tela. O acesso é liberado na hora."
        />
      </div>
    </main>
  );
}
