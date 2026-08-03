"use client";

import { useCallback, useEffect, useState } from "react";
import type { OfertaGrupo, OfertaPlano } from "@/lib/ofertas-planos";
import { listarOfertasPlanos } from "@/services/ofertasService";

interface UseOfertasPlanosOptions {
  grupo?: OfertaGrupo;
  /** Se false, não carrega (útil quando o select ainda não montou). Default true. */
  enabled?: boolean;
}

export function useOfertasPlanos(options: UseOfertasPlanosOptions = {}) {
  const { grupo, enabled = true } = options;
  const [ofertas, setOfertas] = useState<OfertaPlano[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setErro(null);
    try {
      const lista = await listarOfertasPlanos({ grupo });
      setOfertas(lista);
    } catch (error) {
      setOfertas([]);
      setErro(
        error instanceof Error ? error.message : "Erro ao carregar ofertas"
      );
    } finally {
      setLoading(false);
    }
  }, [grupo, enabled]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { ofertas, loading, erro, recarregar };
}
