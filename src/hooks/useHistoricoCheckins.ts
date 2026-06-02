import { useCallback, useEffect, useState } from "react";

interface CheckinHistoricoItem {
  id: string;
  dataHora: string;
  aluno: { nomeCompleto: string };
}

interface CheckinHistoricoApi {
  id: string;
  dataHora: string;
  aluno: { nomeCompleto: string };
}

interface ApiErrorBody {
  error?: string;
}

interface UseHistoricoCheckinsReturn {
  checkins: CheckinHistoricoItem[];
  loading: boolean;
  erro: string | null;
  filtroAlunoId: string;
  setFiltroAlunoId: (id: string) => void;
  recarregar: () => void;
}

async function extrairErro(res: Response): Promise<string> {
  const body: unknown = await res.json();
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

function mapCheckinHistorico(item: CheckinHistoricoApi): CheckinHistoricoItem {
  return {
    id: item.id,
    dataHora: item.dataHora,
    aluno: { nomeCompleto: item.aluno.nomeCompleto },
  };
}

function isCheckinHistoricoApi(value: unknown): value is CheckinHistoricoApi {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  if (
    typeof dados.id !== "string" ||
    typeof dados.dataHora !== "string" ||
    typeof dados.aluno !== "object" ||
    dados.aluno === null
  ) {
    return false;
  }

  const aluno = dados.aluno as Record<string, unknown>;
  return typeof aluno.nomeCompleto === "string";
}

export function useHistoricoCheckins(alunoId?: string): UseHistoricoCheckinsReturn {
  const [checkins, setCheckins] = useState<CheckinHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroAlunoId, setFiltroAlunoId] = useState(alunoId ?? "");

  const carregar = useCallback(async (): Promise<void> => {
    setLoading(true);
    setErro(null);

    try {
      const params = new URLSearchParams();
      if (filtroAlunoId.trim()) {
        params.set("alunoId", filtroAlunoId.trim());
      }

      const query = params.toString();
      const url = query
        ? `/api/professor/checkins?${query}`
        : "/api/professor/checkins";

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(await extrairErro(res));
      }

      const dados: unknown = await res.json();
      if (!Array.isArray(dados)) {
        throw new Error("Resposta inválida");
      }

      const validos = dados.filter(isCheckinHistoricoApi);
      setCheckins(validos.map(mapCheckinHistorico));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao carregar checkins";
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, [filtroAlunoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const recarregar = useCallback((): void => {
    void carregar();
  }, [carregar]);

  return {
    checkins,
    loading,
    erro,
    filtroAlunoId,
    setFiltroAlunoId,
    recarregar,
  };
}
