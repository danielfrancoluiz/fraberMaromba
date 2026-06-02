import { useMemo, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Aluno } from "@/types";
import { listarAlunos } from "@/services/professorService";

interface UseProfessorDashboardReturn {
  alunos: Aluno[];
  alunosFiltrados: Aluno[];
  termoBusca: string;
  setTermoBusca: (v: string) => void;
  loading: boolean;
  erro: string | null;
  totalAlunos: number;
  recarregar: () => void;
}

export function useProfessorDashboard(): UseProfessorDashboardReturn {
  const { data: session, status } = useSession();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const recarregar = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || session?.user?.role !== "professor") {
      setAlunos([]);
      setLoading(false);
      setErro(
        status === "authenticated"
          ? "Acesso negado. Faça login como professor."
          : null
      );
      return;
    }

    let ativo = true;

    const carregarAlunos = async (): Promise<void> => {
      setLoading(true);
      setErro(null);

      try {
        const resultado = await listarAlunos(session.user.id);
        if (ativo) {
          setAlunos(resultado);
        }
      } catch (error) {
        if (ativo) {
          const mensagem =
            error instanceof Error ? error.message : "Erro ao carregar alunos";
          setErro(mensagem);
          setAlunos([]);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    void carregarAlunos();

    return () => {
      ativo = false;
    };
  }, [status, session?.user?.id, session?.user?.role, reloadKey]);

  const alunosFiltrados = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase();
    if (!termo) return alunos;

    return alunos.filter((aluno) =>
      aluno.nomeCompleto.toLowerCase().includes(termo)
    );
  }, [alunos, termoBusca]);

  return {
    alunos,
    alunosFiltrados,
    termoBusca,
    setTermoBusca,
    loading,
    erro,
    totalAlunos: alunos.length,
    recarregar,
  };
}
