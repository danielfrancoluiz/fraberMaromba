import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CheckinItem {
  id: string;
  dataHora: string;
  treinoId?: string;
}

interface CheckinApi {
  id: string;
  dataHora: string;
  treinoId: string | null;
}

interface ApiErrorBody {
  error?: string;
}

interface UseCheckinReturn {
  checkins: CheckinItem[];
  loading: boolean;
  realizandoCheckin: boolean;
  jaFezCheckinHoje: boolean;
  feedbackSucesso: boolean;
  feedbackErro: string | null;
  fazerCheckin: () => Promise<void>;
}

function isHoje(dataHora: string): boolean {
  const data = new Date(dataHora);
  const hoje = new Date();
  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate()
  );
}

function mapCheckin(item: CheckinApi): CheckinItem {
  return {
    id: item.id,
    dataHora: item.dataHora,
    treinoId: item.treinoId ?? undefined,
  };
}

function isCheckinApi(value: unknown): value is CheckinApi {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  return (
    typeof dados.id === "string" &&
    typeof dados.dataHora === "string" &&
    (dados.treinoId === null || typeof dados.treinoId === "string")
  );
}

async function extrairErro(res: Response): Promise<string> {
  const body: unknown = await res.json().catch(() => null);
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ApiErrorBody).error === "string"
  ) {
    return (body as ApiErrorBody).error!;
  }
  return "Erro na requisição";
}

export function useCheckin(treinoId?: string): UseCheckinReturn {
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [realizandoCheckin, setRealizandoCheckin] = useState(false);
  const [feedbackSucesso, setFeedbackSucesso] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);
  const sucessoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carregarCheckins = useCallback(async (): Promise<void> => {
    setLoading(true);
    setFeedbackErro(null);

    try {
      const res = await fetch("/api/aluno/checkin");
      if (!res.ok) {
        throw new Error(await extrairErro(res));
      }

      const dados: unknown = await res.json();
      if (!Array.isArray(dados)) {
        throw new Error("Resposta inválida");
      }

      const validos = dados.filter(isCheckinApi);
      setCheckins(validos.map(mapCheckin));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao carregar checkins";
      setFeedbackErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarCheckins();
  }, [carregarCheckins]);

  const jaFezCheckinHoje = useMemo(
    () => checkins.some((checkin) => isHoje(checkin.dataHora)),
    [checkins]
  );

  const fazerCheckin = useCallback(async (): Promise<void> => {
    setRealizandoCheckin(true);
    setFeedbackErro(null);

    try {
      const res = await fetch("/api/aluno/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(treinoId ? { treinoId } : {}),
      });

      if (!res.ok) {
        throw new Error(await extrairErro(res));
      }

      setFeedbackSucesso(true);

      if (sucessoTimeoutRef.current) {
        clearTimeout(sucessoTimeoutRef.current);
      }

      sucessoTimeoutRef.current = setTimeout(() => {
        setFeedbackSucesso(false);
      }, 2000);

      await carregarCheckins();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao registrar checkin";
      setFeedbackErro(mensagem);
    } finally {
      setRealizandoCheckin(false);
    }
  }, [treinoId, carregarCheckins]);

  useEffect(() => {
    return () => {
      if (sucessoTimeoutRef.current) {
        clearTimeout(sucessoTimeoutRef.current);
      }
    };
  }, []);

  return {
    checkins,
    loading,
    realizandoCheckin,
    jaFezCheckinHoje,
    feedbackSucesso,
    feedbackErro,
    fazerCheckin,
  };
}
