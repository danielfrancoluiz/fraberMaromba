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

  const planoId = session?.user?.planoId;
  const planoVenceEm = session?.user?.planoVenceEm;
  const semPlano = semPlanoContratado(planoId);
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
        titulo={vencido ? "Seu plano venceu" : "Contrate um plano"}
        descricao={
          vencido
            ? "Renove o plano no perfil para continuar usando a plataforma."
            : "Escolha um plano no perfil para liberar o acesso completo."
        }
      />
    );
  }

  if (mostrarAviso && dias !== null) {
    return <AvisoVencimentoPlano diasRestantes={dias} hrefPerfil={hrefPerfil} />;
  }

  return null;
}
