"use client";

import { useState } from "react";
import { isStripePublishableConfigured } from "@/lib/stripe-browser";

interface UsePagamentoProps {
  /** Professor: id do plano. */
  planoId?: string;
  alunoId?: string;
  /** Oferta comercial (aluno). */
  ofertaId?: string;
}

export function usePagamento({ alunoId, planoId, ofertaId }: UsePagamentoProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  async function iniciarPagamento() {
    setLoading(true);
    setErro(null);

    if (!isStripePublishableConfigured()) {
      setErro("Pagamento não configurado. Contate o suporte.");
      setLoading(false);
      return;
    }

    try {
      const payload: {
        planoId?: string;
        alunoId?: string;
        ofertaId?: string;
      } = {};
      if (planoId) payload.planoId = planoId;
      if (alunoId) payload.alunoId = alunoId;
      if (ofertaId) payload.ofertaId = ofertaId;

      const res = await fetch("/api/pagamentos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const body: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error: string }).error === "string"
            ? (body as { error: string }).error
            : "Erro ao iniciar pagamento";
        setErro(msg);
        return;
      }

      const secret =
        typeof body === "object" &&
        body !== null &&
        "clientSecret" in body &&
        typeof (body as { clientSecret: string }).clientSecret === "string"
          ? (body as { clientSecret: string }).clientSecret
          : null;

      if (!secret) {
        setErro("Resposta de pagamento inválida.");
        return;
      }

      setClientSecret(secret);
    } catch {
      setErro("Erro ao iniciar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  function cancelarPagamento() {
    setClientSecret(null);
    setErro(null);
  }

  return {
    loading,
    erro,
    clientSecret,
    iniciarPagamento,
    cancelarPagamento,
  };
}
