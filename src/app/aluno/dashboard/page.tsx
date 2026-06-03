"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ChevronRight, Dumbbell } from "lucide-react";
import { useAlunoDashboard } from "@/hooks/useAlunoDashboard";
import { DashboardHeroHeader } from "@/components/DashboardHeroHeader";
import { TreinoResumoCard } from "@/components/aluno/TreinoResumoCard";
import { PlanoStatus } from "@/components/aluno/PlanoStatus";
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
      <div className="page-container">
        <DashboardHeroHeader
          nome={aluno?.nome ?? session?.user?.name ?? "Aluno"}
          role="aluno"
          stats={[
            { valor: stats?.treinosConcluidos ?? "—", label: "Concluídos" },
            { valor: stats ? `${stats.minutosTotais} min` : "—", label: "Minutos" },
            { valor: stats?.planosAtivos ?? "—", label: "Plano ativo" },
          ]}
        />

        <PlanoStatus
          alunoId={session?.user?.id ?? ""}
          planoId={session?.user?.planoId ?? stats?.planoId ?? "mensal"}
          status={session?.user?.status ?? "inativo"}
        />

        {stats && stats.ultimasSessoes.length > 0 ? (
          <section style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <h2 className="section-title" style={{ margin: 0 }}>
                Últimos treinos
              </h2>
              <Link
                href="/aluno/historico"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--fraber-primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Ver histórico
              </Link>
            </div>
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
                  <span className="historico-badge">Concluído</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <h2 className="section-title" style={{ margin: 0 }}>
              Treinos de hoje
            </h2>
            <Link
              href="/aluno/treinos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.8125rem",
                color: "var(--fraber-primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <p className="text-muted" style={{ textAlign: "center" }}>Carregando...</p>
          ) : erro ? (
            <p className="text-accent" style={{ textAlign: "center" }}>{erro}</p>
          ) : treinosDoDia.length === 0 ? (
            <div className="card" style={{ textAlign: "center" }}>
              <Dumbbell
                size={32}
                style={{ margin: "0 auto 8px", color: "var(--fraber-text-muted)" }}
              />
              <p className="text-muted" style={{ margin: 0 }}>
                Nenhum treino para {DIA_LABELS[diaSelecionado]?.toLowerCase() ?? "hoje"}.
              </p>
              <Link
                href="/aluno/treinos"
                className="btn-primary"
                style={{
                  marginTop: "12px",
                  display: "inline-block",
                  textDecoration: "none",
                  padding: "10px 16px",
                }}
              >
                Ver semana
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
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
        </section>
      </div>
    </main>
  );
}
