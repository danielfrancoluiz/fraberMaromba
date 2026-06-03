"use client";

import { useState } from "react";

interface UsePagamentoProps {
  alunoId: string;
  planoId: string;
}

export function usePagamento({ alunoId, planoId }: UsePagamentoProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function iniciarPagamento() {
    if (!alunoId) {
      setErro("Aluno não identificado.");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/pagamentos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ alunoId, planoId }),
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
