import { useCallback, useEffect, useState } from "react";
import { Aluno, Treino } from "@/types";
import { buscarAluno, listarTreinosDoAluno } from "@/services/professorService";

interface UseAlunoDetalhesReturn {
  aluno: Aluno | null;
  treinos: Treino[];
  loading: boolean;
  erro: string | null;
  modoEdicao: boolean;
  setModoEdicao: (v: boolean) => void;
  recarregar: () => void;
}

export function useAlunoDetalhes(alunoId: string): UseAlunoDetalhesReturn {
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const recarregar = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ativo = true;

    const carregarDados = async (): Promise<void> => {
      setLoading(true);
      setErro(null);

      try {
        const [alunoData, treinosData] = await Promise.all([
          buscarAluno(alunoId),
          listarTreinosDoAluno(alunoId),
        ]);

        if (!ativo) return;

        setAluno(alunoData);
        setTreinos(treinosData);
      } catch (error) {
        if (!ativo) return;
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao carregar dados do aluno";
        setErro(mensagem);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, [alunoId, reloadKey]);

  return {
    aluno,
    treinos,
    loading,
    erro,
    modoEdicao,
    setModoEdicao,
    recarregar,
  };
}
