"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Plus, Users } from "lucide-react";
import { useProfessorDashboard } from "@/hooks/useProfessorDashboard";
import { DashboardHeroHeader } from "@/components/DashboardHeroHeader";
import { ResumoAlunos } from "@/components/professor/ResumoAlunos";
import { AlunoCard } from "@/components/professor/AlunoCard";
import { FABActions } from "@/components/professor/FABActions";
import { GerarConviteButton } from "@/components/professor/GerarConviteButton";
import { buscarEstatisticasSessaoProfessor } from "@/services/sessaoService";
import { EstatisticasSessaoProfessor } from "@/types";

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
    <section className="card">
      <p className="text-muted" style={{ margin: 0, fontSize: "0.95rem" }}>
        Presenças Hoje
      </p>
      <strong
        style={{
          marginTop: "8px",
          display: "inline-block",
          color: "var(--fraber-primary)",
          fontSize: "2rem",
          lineHeight: 1.1,
        }}
      >
        {total === null ? "—" : total}
      </strong>
    </section>
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
      <div className="page-container">
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

        <section>
          <h2 className="section-title">Ações rápidas</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="card card-hover"
              onClick={() => router.push("/professor/alunos/novo")}
              style={{
                cursor: "pointer",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                background: "rgba(59, 130, 246, 0.1)",
                textAlign: "center",
                padding: "1rem",
              }}
            >
              <Plus size={22} style={{ margin: "0 auto 8px", color: "var(--fraber-primary)" }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Novo aluno</p>
            </button>
            <button
              type="button"
              className="card card-hover"
              onClick={() => router.push("/professor/alunos")}
              style={{
                cursor: "pointer",
                textAlign: "center",
                padding: "1rem",
              }}
            >
              <Users size={22} style={{ margin: "0 auto 8px", color: "var(--fraber-primary)" }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Ver alunos</p>
            </button>
          </div>
        </section>

        <div style={{ display: "grid", gap: "1rem" }}>
          <ResumoAlunos total={totalAlunos} />
          <PresencasHojeCard total={presencasHoje} />
        </div>

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
              Meus alunos
            </h2>
            <Link
              href="/professor/alunos"
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
          ) : previewAlunos.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {previewAlunos.map((aluno) => (
                <AlunoCard key={aluno.id} aluno={aluno} nomePlano={aluno.planoId} />
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ textAlign: "center", margin: "1.5rem 0" }}>
              Nenhum aluno cadastrado.
            </p>
          )}
        </section>
      </div>

      <FABActions
        className="fab-above-nav"
        onCadastrar={() => router.push("/professor/alunos/novo")}
        onCriarTreino={() => router.push("/professor/treinos")}
      />
    </main>
  );
}
