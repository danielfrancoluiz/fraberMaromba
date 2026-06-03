import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TreinoTemplate } from "@/types";
import { listarTemplates } from "@/services/professorService";

interface UseTreinosTemplateReturn {
  templates: TreinoTemplate[];
  loading: boolean;
  erro: string | null;
  recarregar: () => void;
}

export function useTreinosTemplate(): UseTreinosTemplateReturn {
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<TreinoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const recarregar = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const professorId = session?.user?.id;
    if (!professorId) {
      setLoading(false);
      return;
    }

    let ativo = true;

    const carregarTemplates = async (): Promise<void> => {
      setLoading(true);
      setErro(null);

      try {
        const lista = await listarTemplates(professorId);
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
  }, [reloadKey, status, session?.user?.id]);

  return { templates, loading, erro, recarregar };
}
