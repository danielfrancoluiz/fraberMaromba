"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAlunoDashboard } from "@/hooks/useAlunoDashboard";
import { NavDiasSemana } from "@/components/aluno/NavDiasSemana";
import { TreinoResumoCard } from "@/components/aluno/TreinoResumoCard";
import { PlanoStatus } from "@/components/aluno/PlanoStatus";
import { buscarProgresso } from "@/services/alunoService";
import { useEffect, useState } from "react";
import { Treino } from "@/types";

const DIAS_SEMANA = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

const colors = {
  background: "#0D1B2E",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
};

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    treinosPorDia,
    loading,
    erro,
    aluno,
    diaSelecionado,
    setDiaSelecionado,
  } = useAlunoDashboard();

  const [concluidosPorTreino, setConcluidosPorTreino] = useState<
    Record<string, number>
  >({});

  const treinosDoDia: Treino[] = treinosPorDia[diaSelecionado] ?? [];

  useEffect(() => {
    const treinos = treinosPorDia[diaSelecionado] ?? [];

    if (!aluno || treinos.length === 0) {
      setConcluidosPorTreino({});
      return;
    }

    let ativo = true;

    const carregarProgressos = async (): Promise<void> => {
      const entradas = await Promise.all(
        treinos.map(async (treino) => {
          const progresso = await buscarProgresso(treino.id, aluno.id);
          return [treino.id, progresso?.exerciciosConcluidos.length ?? 0] as const;
        })
      );

      if (!ativo) return;
      setConcluidosPorTreino(Object.fromEntries(entradas));
    };

    void carregarProgressos();

    return () => {
      ativo = false;
    };
  }, [aluno, diaSelecionado, treinosPorDia]);

  return (
    <main
      className="aluno-page"
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="aluno-page-container">
        <header style={{ marginBottom: "20px" }}>
          <h1 style={{ margin: 0, color: colors.textPrimary, fontSize: "1.4rem" }}>
            Olá, {aluno?.nome ?? "Aluno"}
          </h1>
          <p style={{ margin: "6px 0 0", color: colors.textSecondary }}>
            Seus treinos da semana
          </p>
        </header>

        <PlanoStatus
          alunoId={session?.user?.id ?? ""}
          planoId={session?.user?.planoId ?? "mensal"}
          status={session?.user?.status ?? "inativo"}
        />

        <NavDiasSemana
          dias={DIAS_SEMANA}
          diaSelecionado={diaSelecionado}
          onChange={setDiaSelecionado}
        />

        {loading ? (
          <p
            style={{
              marginTop: "24px",
              textAlign: "center",
              color: colors.textSecondary,
            }}
          >
            Carregando...
          </p>
        ) : erro ? (
          <p
            style={{
              marginTop: "24px",
              textAlign: "center",
              color: "#E8001C",
            }}
          >
            {erro}
          </p>
        ) : treinosDoDia.length === 0 ? (
          <p
            style={{
              marginTop: "24px",
              textAlign: "center",
              color: colors.textSecondary,
            }}
          >
            Nenhum treino para este dia.
          </p>
        ) : (
          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gap: "12px",
            }}
          >
            {treinosDoDia.map((treino) => (
              <TreinoResumoCard
                key={treino.id}
                treino={treino}
                concluidos={concluidosPorTreino[treino.id] ?? 0}
                onClick={() => router.push(`/aluno/treino/${treino.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .aluno-page {
          width: 100%;
          padding: 1rem 1rem 2rem;
        }
        .aluno-page-container {
          width: 100%;
        }
        @media (min-width: 768px) {
          .aluno-page-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .aluno-page {
            padding: 1.5rem 2rem 2rem;
          }
        }
        @media (min-width: 1024px) {
          .aluno-page-container {
            max-width: 800px;
          }
          .aluno-page {
            padding: 2rem 3rem 2rem;
          }
        }
      `}</style>
    </main>
  );
}
