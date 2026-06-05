"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Users } from "lucide-react";
import { useProfessorDashboard } from "@/hooks/useProfessorDashboard";
import { DashboardHeroHeader } from "@/components/DashboardHeroHeader";
import { ResumoAlunos } from "@/components/professor/ResumoAlunos";
import { AlunoCard } from "@/components/professor/AlunoCard";
import { FABActions } from "@/components/professor/FABActions";
import { GerarConviteButton } from "@/components/professor/GerarConviteButton";
import { buscarEstatisticasSessaoProfessor } from "@/services/sessaoService";
import { EstatisticasSessaoProfessor } from "@/types";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";

function intervaloHoje(): { dataInicio: string; dataFim: string } {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date();
  fim.setHours(23, 59, 59, 999);
  return {
    dataInicio: inicio.toISOString(),
    dataFim: fim.toISOString(),
  };
}

function PresencasHojeCard({ total }: { total: number | null }) {
  return (
    <article className="stat-tile">
      <p className="stat-tile-value">{total === null ? "—" : total}</p>
      <p className="stat-tile-label">Presenças hoje</p>
    </article>
  );
}

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const { alunosFiltrados, loading, erro, totalAlunos } = useProfessorDashboard();
  const [presencasHoje, setPresencasHoje] = useState<number | null>(null);
  const [statsSessoes, setStatsSessoes] = useState<EstatisticasSessaoProfessor | null>(
    null
  );

  const previewAlunos = alunosFiltrados.slice(0, 3);

  useEffect(() => {
    let ativo = true;
    void buscarEstatisticasSessaoProfessor()
      .then((d) => {
        if (ativo) setStatsSessoes(d);
      })
      .catch(() => {
        if (ativo) setStatsSessoes(null);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    const carregarPresencas = async (): Promise<void> => {
      const { dataInicio, dataFim } = intervaloHoje();
      const params = new URLSearchParams({ dataInicio, dataFim });

      try {
        const res = await fetch(`/api/professor/checkins?${params.toString()}`);
        if (!ativo) return;

        if (!res.ok) {
          setPresencasHoje(0);
          return;
        }

        const dados: unknown = await res.json();
        if (Array.isArray(dados) && ativo) {
          setPresencasHoje(dados.length);
        }
      } catch {
        if (ativo) setPresencasHoje(0);
      }
    };

    void carregarPresencas();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <DashboardHeroHeader
          nome={session?.user?.name ?? "Professor"}
          role="professor"
          stats={[
            { valor: totalAlunos, label: "Alunos" },
            { valor: statsSessoes?.treinosConcluidos ?? "—", label: "Treinos feitos" },
            {
              valor: statsSessoes ? `${statsSessoes.minutosTotais} min` : "—",
              label: "Minutos",
            },
          ]}
        />

        <GerarConviteButton professorId={session?.user?.id ?? ""} />

        <Section title="Ações rápidas">
          <div className="quick-action-grid">
            <button
              type="button"
              className="quick-action-card quick-action-card--primary"
              onClick={() => router.push("/professor/alunos/novo")}
            >
              <Plus size={22} />
              <p>Novo aluno</p>
            </button>
            <button
              type="button"
              className="quick-action-card"
              onClick={() => router.push("/professor/alunos")}
            >
              <Users size={22} />
              <p>Ver alunos</p>
            </button>
          </div>
        </Section>

        <div className="stats-row stats-row--3">
          <ResumoAlunos total={totalAlunos} />
          <PresencasHojeCard total={presencasHoje} />
        </div>

        <Section title="Meus alunos" href="/professor/alunos">
          {loading ? (
            <p className="loading-center text-muted">Carregando...</p>
          ) : erro ? (
            <p className="error-center text-accent">{erro}</p>
          ) : previewAlunos.length > 0 ? (
            <div className="page-stack">
              {previewAlunos.map((aluno) => (
                <AlunoCard key={aluno.id} aluno={aluno} nomePlano={aluno.planoId} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Nenhum aluno cadastrado"
              description="Cadastre seu primeiro aluno para começar a montar treinos."
              action={
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => router.push("/professor/alunos/novo")}
                >
                  Cadastrar aluno
                </button>
              }
            />
          )}
        </Section>
      </div>

      <FABActions
        className="fab-above-nav"
        onCadastrar={() => router.push("/professor/alunos/novo")}
        onCriarTreino={() => router.push("/professor/treinos/montar")}
      />
    </main>
  );
}
