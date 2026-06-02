"use client";

import { useState } from "react";

interface UsePagamentoProps {
  alunoId: string;
  planoId: string;
}

export function usePagamento({ alunoId, planoId }: UsePagamentoProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const PAYMENT_LINKS: Record<string, string> = {
    mensal: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MENSAL ?? "",
    semestral: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MENSAL ?? "",
    anual: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MENSAL ?? "",
    avulso: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MENSAL ?? "",
  };

  async function iniciarPagamento() {
    setLoading(true);
    setErro(null);
    try {
      const link = PAYMENT_LINKS[planoId];
      if (!link) {
        setErro("Link de pagamento não configurado para este plano.");
        return;
      }
      const paymentUrl = `${link}?client_reference_id=${alunoId}&return_url=${encodeURIComponent(window.location.origin + "/pagamento/sucesso")}`;
      window.open(paymentUrl, "_blank");
    } catch {
      setErro("Erro ao redirecionar para o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, erro, iniciarPagamento };
}
