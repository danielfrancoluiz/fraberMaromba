"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAlunoDashboard } from "@/hooks/useAlunoDashboard";
import { AppTopBar } from "@/components/AppTopBar";
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
    <main className="page-main">
      <div className="page-container">
        <AppTopBar
          title={`Olá, ${aluno?.nome ?? "Aluno"}`}
          subtitle="Seus treinos da semana"
          logoSize={48}
        />

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
          <p className="text-muted" style={{ marginTop: "24px", textAlign: "center" }}>
            Carregando...
          </p>
        ) : erro ? (
          <p className="text-accent" style={{ marginTop: "24px", textAlign: "center" }}>
            {erro}
          </p>
        ) : treinosDoDia.length === 0 ? (
          <p className="text-muted" style={{ marginTop: "24px", textAlign: "center" }}>
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
    </main>
  );
}
