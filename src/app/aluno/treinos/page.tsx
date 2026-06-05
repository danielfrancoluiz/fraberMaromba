"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { useAlunoDashboard } from "@/hooks/useAlunoDashboard";
import { NavDiasSemana } from "@/components/aluno/NavDiasSemana";
import { TreinoResumoCard } from "@/components/aluno/TreinoResumoCard";
import { contarSeriesConcluidasTreino } from "@/services/sessaoService";
import { Treino } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

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
    diaSelecionado,
    setDiaSelecionado,
  } = useAlunoDashboard();

  const [seriesPorTreino, setSeriesPorTreino] = useState<Record<string, number>>({});

  const treinosDoDia: Treino[] = treinosPorDia[diaSelecionado] ?? [];
  const primeiroNome = session?.user?.name?.split(" ")[0];

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
      <div className="page-container page-stack">
        <PageHeader
          title="Meus treinos"
          subtitle={
            primeiroNome
              ? `Olá, ${primeiroNome} — sua programação semanal`
              : "Sua programação semanal"
          }
        />

        <NavDiasSemana
          dias={DIAS_SEMANA}
          diaSelecionado={diaSelecionado}
          onChange={setDiaSelecionado}
        />

        {loading ? (
          <p className="loading-center text-muted">Carregando...</p>
        ) : erro ? (
          <p className="error-center text-accent">{erro}</p>
        ) : treinosDoDia.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="Nenhum treino neste dia"
            description="Selecione outro dia ou peça ao seu professor para montar seu plano."
          />
        ) : (
          <div className="page-stack">
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
