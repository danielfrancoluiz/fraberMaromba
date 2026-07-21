"use client";

import { useEffect, useState } from "react";
import type { PlanoOpcao } from "@/lib/planos-pagamento";

export function usePlanos(opcoes?: { checkout?: boolean; todos?: boolean }) {
  const [planos, setPlanos] = useState<PlanoOpcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const params = new URLSearchParams();
        if (opcoes?.checkout) params.set("checkout", "1");
        if (opcoes?.todos) params.set("todos", "1");
        const qs = params.toString();
        const res = await fetch(`/api/planos${qs ? `?${qs}` : ""}`, {
          credentials: "include",
        });
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof (body as { error: unknown }).error === "string"
              ? (body as { error: string }).error
              : "Erro ao carregar planos";
          throw new Error(msg);
        }
        if (!cancelado) {
          setPlanos(Array.isArray(body) ? (body as PlanoOpcao[]) : []);
        }
      } catch (error) {
        if (!cancelado) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar planos");
          setPlanos([]);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void carregar();
    return () => {
      cancelado = true;
    };
  }, [opcoes?.checkout, opcoes?.todos]);

  return { planos, loading, erro, setPlanos };
}
