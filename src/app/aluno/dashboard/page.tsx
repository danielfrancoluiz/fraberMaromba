"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { useAlunoDashboard } from "@/hooks/useAlunoDashboard";
import { DashboardHeroHeader } from "@/components/DashboardHeroHeader";
import { TreinoResumoCard } from "@/components/aluno/TreinoResumoCard";
import { PlanoStatus } from "@/components/aluno/PlanoStatus";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import {
  buscarEstatisticasSessaoAluno,
  contarSeriesConcluidasTreino,
  formatarDataSessao,
  formatarDuracaoSessao,
} from "@/services/sessaoService";
import { EstatisticasSessaoAluno, Treino } from "@/types";

const DIA_LABELS: Record<string, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const { treinosPorDia, loading, erro, aluno, diaSelecionado } = useAlunoDashboard();

  const [stats, setStats] = useState<EstatisticasSessaoAluno | null>(null);
  const [seriesPorTreino, setSeriesPorTreino] = useState<Record<string, number>>({});

  const treinosDoDia: Treino[] = treinosPorDia[diaSelecionado] ?? [];

  useEffect(() => {
    let ativo = true;
    void buscarEstatisticasSessaoAluno()
      .then((dados) => {
        if (ativo) setStats(dados);
      })
      .catch(() => {
        if (ativo) setStats(null);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const treinos = treinosPorDia[diaSelecionado] ?? [];
    if (treinos.length === 0) {
      setSeriesPorTreino({});
      return;
    }

    let ativo = true;

    const carregar = async (): Promise<void> => {
      const entradas = await Promise.all(
        treinos.map(async (treino) => {
          const totalSeries = treino.exercicios.reduce((a, ex) => a + ex.series, 0);
          const concluidas = await contarSeriesConcluidasTreino(treino.id, totalSeries);
          return [treino.id, concluidas] as const;
        })
      );
      if (ativo) setSeriesPorTreino(Object.fromEntries(entradas));
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [diaSelecionado, treinosPorDia]);

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <DashboardHeroHeader
          nome={aluno?.nome ?? session?.user?.name ?? "Aluno"}
          role="aluno"
          badgeExtra={
            stats ? `${stats.treinosConcluidos} treinos` : undefined
          }
          stats={[
            { valor: stats?.treinosConcluidos ?? "—", label: "Concluídos" },
            { valor: stats ? `${stats.minutosTotais} min` : "—", label: "Minutos" },
            { valor: stats?.planosAtivos ?? "—", label: "Plano ativo" },
          ]}
        />

        {session?.user?.status === "inativo" ? (
          <PlanoStatus
            alunoId={session?.user?.alunoId ?? ""}
            planoId={session?.user?.planoId ?? stats?.planoId ?? "mensal"}
            status={session?.user?.status ?? "inativo"}
            mostrarPagamento
          />
        ) : null}

        {stats && stats.ultimasSessoes.length > 0 ? (
          <Section title="Últimos treinos" href="/aluno/historico" linkLabel="Ver histórico">
            <div className="historico-ultimos">
              {stats.ultimasSessoes.map((s) => (
                <div key={s.id} className="historico-ultimo-item">
                  <div>
                    <strong>{s.treinoNome}</strong>
                    <br />
                    <span>
                      {formatarDataSessao(s.finalizadoEm)} ·{" "}
                      {formatarDuracaoSessao(s.duracaoSegundos)}
                    </span>
                  </div>
                  <Badge variant="success">Concluído</Badge>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        <Section
          title={`Treinos de ${DIA_LABELS[diaSelecionado]?.toLowerCase() ?? "hoje"}`}
          href="/aluno/treinos"
          linkLabel="Ver semana"
        >
          {loading ? (
            <p className="loading-center text-muted">Carregando...</p>
          ) : erro ? (
            <p className="error-center text-accent">{erro}</p>
          ) : treinosDoDia.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Nenhum treino para hoje"
              description="Confira a programação completa da semana."
              action={
                <Link href="/aluno/treinos" className="btn-primary">
                  Ver treinos da semana
                </Link>
              }
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
        </Section>
      </div>
    </main>
  );
}
