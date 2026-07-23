import { useMemo, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Aluno } from "@/types";
import { listarAlunos } from "@/services/professorService";
import { mensagemErroBanco } from "@/lib/erro-banco";

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
  const [fetchingAlunos, setFetchingAlunos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const sessionLoading = status === "loading";
  const loading =
    sessionLoading ||
    (status === "authenticated" &&
      session?.user?.role === "professor" &&
      fetchingAlunos);

  const recarregar = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || session?.user?.role !== "professor") {
      setAlunos([]);
      setFetchingAlunos(false);
      setErro(
        status === "unauthenticated"
          ? "Faça login como professor."
          : status === "authenticated"
            ? "Acesso negado. Faça login como professor."
            : null
      );
      return;
    }

    let ativo = true;

    const carregarAlunos = async (): Promise<void> => {
      setFetchingAlunos(true);
      setErro(null);

      try {
        const resultado = await listarAlunos(session.user.id);
        if (ativo) {
          setAlunos(resultado);
        }
      } catch (error) {
        if (ativo) {
          setErro(mensagemErroBanco(error));
          setAlunos([]);
        }
      } finally {
        if (ativo) {
          setFetchingAlunos(false);
        }
      }
    };

    void carregarAlunos();

    return () => {
      ativo = false;
      setFetchingAlunos(false);
    };
  }, [status, session?.user?.id, session?.user?.role, reloadKey]);

  const alunosFiltrados = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase();
    const base = termo
      ? alunos.filter((aluno) =>
          aluno.nomeCompleto.toLowerCase().includes(termo)
        )
      : alunos;

    return [...base].sort((a, b) =>
      a.nomeCompleto.localeCompare(b.nomeCompleto, "pt-BR", {
        sensitivity: "base",
      })
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
