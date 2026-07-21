"use client";

import { useState } from "react";

interface UsePagamentoProps {
  planoId: string;
  /** Se informado, cobra plano do aluno. Se omitido (professor), cobra a própria assinatura. */
  alunoId?: string;
}

export function usePagamento({ alunoId, planoId }: UsePagamentoProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function iniciarPagamento() {
    setLoading(true);
    setErro(null);

    try {
      const payload: { planoId: string; alunoId?: string } = { planoId };
      if (alunoId) payload.alunoId = alunoId;

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

      const url =
        typeof body === "object" &&
        body !== null &&
        "url" in body &&
        typeof (body as { url: string }).url === "string"
          ? (body as { url: string }).url
          : null;

      if (!url) {
        setErro("Resposta de pagamento inválida.");
        return;
      }

      window.location.href = url;
    } catch {
      setErro("Erro ao redirecionar para o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, erro, iniciarPagamento };
}
