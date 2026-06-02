import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlunoMock, Treino } from "@/types";
import { listarTreinosDoAlunoPorDia } from "@/services/alunoService";

interface UseAlunoDashboardReturn {
  treinosPorDia: Record<string, Treino[]>;
  loading: boolean;
  erro: string | null;
  aluno: AlunoMock | null;
  diaSelecionado: string;
  setDiaSelecionado: (d: string) => void;
}

function getDiaSemanaAtual(): string {
  const dias: Record<number, string> = {
    0: "domingo",
    1: "segunda",
    2: "terca",
    3: "quarta",
    4: "quinta",
    5: "sexta",
    6: "sabado",
  };
  return dias[new Date().getDay()] ?? "segunda";
}

export function useAlunoDashboard(): UseAlunoDashboardReturn {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [treinosPorDia, setTreinosPorDia] = useState<Record<string, Treino[]>>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aluno, setAluno] = useState<AlunoMock | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState(getDiaSemanaAtual);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const alunoId = session?.user?.id;
    const nomeAluno = session?.user?.name;

    if (!alunoId) {
      setLoading(false);
      return;
    }

    let ativo = true;

    const carregar = async (): Promise<void> => {
      setLoading(true);
      setErro(null);

      setAluno({
        id: alunoId,
        nome: nomeAluno ?? "",
        email: session?.user?.email ?? "",
        senha: "",
      });

      try {
        const treinos = await listarTreinosDoAlunoPorDia(alunoId);
        if (ativo) {
          setTreinosPorDia(treinos);
        }
      } catch (error) {
        if (!ativo) return;
        const mensagem =
          error instanceof Error ? error.message : "Erro ao carregar treinos";
        setErro(mensagem);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [status, session, router]);

  return {
    treinosPorDia,
    loading,
    erro,
    aluno,
    diaSelecionado,
    setDiaSelecionado,
  };
}
