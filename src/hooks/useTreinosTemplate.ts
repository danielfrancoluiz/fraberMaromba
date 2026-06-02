import { useCallback, useEffect, useState } from "react";
import { TreinoTemplate } from "@/types";
import { listarTemplates } from "@/services/professorService";
import { professorAtivo } from "@/mocks/professorMock";

interface UseTreinosTemplateReturn {
  templates: TreinoTemplate[];
  loading: boolean;
  erro: string | null;
  recarregar: () => void;
}

export function useTreinosTemplate(): UseTreinosTemplateReturn {
  const [templates, setTemplates] = useState<TreinoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const recarregar = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ativo = true;

    const carregarTemplates = async (): Promise<void> => {
      setLoading(true);
      setErro(null);

      try {
        const lista = await listarTemplates(professorAtivo.id);
        if (!ativo) return;
        setTemplates(lista);
      } catch (error) {
        if (!ativo) return;
        const mensagem =
          error instanceof Error ? error.message : "Erro ao carregar templates";
        setErro(mensagem);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void carregarTemplates();

    return () => {
      ativo = false;
    };
  }, [reloadKey]);

  return { templates, loading, erro, recarregar };
}
