"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AvisoVencimentoPlano,
  ContratarPlanoBanner,
  semPlanoContratado,
} from "@/components/pagamento/ContratarPlanoBanner";
import {
  deveMostrarAvisoVencimento,
  diasRestantesPlano,
  planoVencido,
} from "@/lib/plano-vencimento";

interface PlanoDashboardBannersProps {
  hrefPlanos: string;
  hrefPerfil: string;
}

export function PlanoDashboardBanners({
  hrefPlanos,
  hrefPerfil,
}: PlanoDashboardBannersProps) {
  const { data: session } = useSession();
  const [diasAviso, setDiasAviso] = useState(5);

  useEffect(() => {
    let ativo = true;
    void fetch("/api/config")
      .then((r) => r.json())
      .then((body: unknown) => {
        if (!ativo) return;
        if (
          typeof body === "object" &&
          body !== null &&
          "diasAvisoVencimento" in body &&
          typeof (body as { diasAvisoVencimento: number }).diasAvisoVencimento ===
            "number"
        ) {
          setDiasAviso(
            (body as { diasAvisoVencimento: number }).diasAvisoVencimento
          );
        }
      })
      .catch(() => {
        /* mantém default */
      });
    return () => {
      ativo = false;
    };
  }, []);

  const role = session?.user?.role;
  const planoId = session?.user?.planoId;
  const planoVenceEm = session?.user?.planoVenceEm;
  const modulosAtivos = session?.user?.modulosAtivos;

  const semPlano =
    role === "aluno"
      ? semPlanoContratado({ planoVenceEm, modulosAtivos })
      : semPlanoContratado(planoId);

  const vencido = planoVencido(planoVenceEm);
  const dias = diasRestantesPlano(planoVenceEm);
  const mostrarAviso =
    !semPlano &&
    !vencido &&
    deveMostrarAvisoVencimento(planoVenceEm, diasAviso);

  if (semPlano || vencido) {
    return (
      <ContratarPlanoBanner
        href={hrefPlanos}
        titulo={vencido ? "Seu plano venceu" : "Contrate seus módulos"}
        descricao={
          vencido
            ? "Renove os módulos desejados para continuar usando a plataforma."
            : "Escolha Musculação, Corrida e/ou Nutrição para liberar o acesso."
        }
      />
    );
  }

  if (mostrarAviso && dias !== null) {
    return <AvisoVencimentoPlano diasRestantes={dias} hrefPerfil={hrefPerfil} />;
  }

  return null;
}
