"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAlunoDashboard } from "@/hooks/useAlunoDashboard";
import { NavDiasSemana } from "@/components/aluno/NavDiasSemana";
import { TreinoResumoCard } from "@/components/aluno/TreinoResumoCard";
import { contarSeriesConcluidasTreino } from "@/services/sessaoService";
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

  const [seriesPorTreino, setSeriesPorTreino] = useState<Record<string, number>>({});

  const treinosDoDia: Treino[] = treinosPorDia[diaSelecionado] ?? [];

  useEffect(() => {
    const treinos = treinosPorDia[diaSelecionado] ?? [];

    if (treinos.length === 0) {
      setSeriesPorTreino({});
      return;
    }

    let ativo = true;

    const carregarProgressos = async (): Promise<void> => {
      const entradas = await Promise.all(
        treinos.map(async (treino) => {
          const totalSeries = treino.exercicios.reduce((a, ex) => a + ex.series, 0);
          const concluidas = await contarSeriesConcluidasTreino(treino.id, totalSeries);
          return [treino.id, concluidas] as const;
        })
      );

      if (!ativo) return;
      setSeriesPorTreino(Object.fromEntries(entradas));
    };

    void carregarProgressos();

    return () => {
      ativo = false;
    };
  }, [diaSelecionado, treinosPorDia]);

  return (
    <main className="page-main">
      <div className="page-container" style={{ paddingTop: "1rem" }}>
        <header style={{ marginBottom: "1rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Meus Treinos</h1>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
            {session?.user?.name ? `Olá, ${session.user.name.split(" ")[0]}` : "Sua programação semanal"}
          </p>
        </header>

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
          <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
            {treinosDoDia.map((treino) => (
              <TreinoResumoCard
                key={treino.id}
                treino={treino}
                seriesConcluidas={seriesPorTreino[treino.id] ?? 0}
                onClick={() => router.push(`/aluno/treino/${treino.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
