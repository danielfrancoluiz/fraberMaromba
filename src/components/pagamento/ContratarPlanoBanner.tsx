"use client";

import Link from "next/link";
import { AlertTriangle, CreditCard } from "lucide-react";

interface ContratarPlanoBannerProps {
  href: string;
  titulo?: string;
  descricao?: string;
}

export function ContratarPlanoBanner({
  href,
  titulo = "Contrate um plano",
  descricao = "Você ainda não tem um plano ativo. Escolha um plano para liberar o acesso completo.",
}: ContratarPlanoBannerProps) {
  return (
    <article className="card contratar-plano-banner">
      <div className="contratar-plano-banner-icon" aria-hidden>
        <CreditCard size={28} />
      </div>
      <div className="contratar-plano-banner-texto">
        <h2 className="contratar-plano-banner-titulo">{titulo}</h2>
        <p className="text-muted" style={{ margin: 0 }}>
          {descricao}
        </p>
      </div>
      <Link href={href} className="btn-primary btn-compact">
        Ver planos
      </Link>
    </article>
  );
}

interface AvisoVencimentoPlanoProps {
  diasRestantes: number;
  hrefPerfil: string;
}

export function AvisoVencimentoPlano({
  diasRestantes,
  hrefPerfil,
}: AvisoVencimentoPlanoProps) {
  const texto =
    diasRestantes === 0
      ? "Seu plano vence hoje."
      : diasRestantes === 1
        ? "Falta 1 dia para o seu plano vencer."
        : `Faltam ${diasRestantes} dias para o seu plano vencer.`;

  return (
    <article className="card aviso-vencimento-banner">
      <div className="aviso-vencimento-banner-icon" aria-hidden>
        <AlertTriangle size={24} />
      </div>
      <div className="contratar-plano-banner-texto">
        <h2 className="contratar-plano-banner-titulo">{texto}</h2>
        <p className="text-muted" style={{ margin: 0 }}>
          Renove no perfil para não perder o acesso.
        </p>
      </div>
      <Link href={hrefPerfil} className="btn-secondary btn-compact">
        Renovar no perfil
      </Link>
    </article>
  );
}

/** Sem plano = string vazia / ausente. */
export function semPlanoContratado(planoId?: string | null): boolean {
  return !planoId?.trim();
}
