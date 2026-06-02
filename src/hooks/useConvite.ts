import { useCallback, useRef, useState } from "react";
import { gerarConvite } from "@/services/professorService";

interface UseConviteReturn {
  gerarLink: () => Promise<void>;
  linkGerado: string | null;
  copiado: boolean;
  loading: boolean;
  erro: string | null;
  copiarLink: () => Promise<void>;
}

export function useConvite(professorId: string): UseConviteReturn {
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const copiadoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gerarLink = useCallback(async (): Promise<void> => {
    setLoading(true);
    setErro(null);
    setCopiado(false);

    try {
      const convite = await gerarConvite(professorId);
      const url = `${window.location.origin}/cadastro?convite=${convite.token}`;
      setLinkGerado(url);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao gerar convite";
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, [professorId]);

  const copiarLink = useCallback(async (): Promise<void> => {
    if (!linkGerado) return;

    try {
      await navigator.clipboard.writeText(linkGerado);
      setCopiado(true);

      if (copiadoTimeoutRef.current) {
        clearTimeout(copiadoTimeoutRef.current);
      }

      copiadoTimeoutRef.current = setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao copiar link";
      setErro(mensagem);
    }
  }, [linkGerado]);

  return {
    gerarLink,
    linkGerado,
    copiado,
    loading,
    erro,
    copiarLink,
  };
}
