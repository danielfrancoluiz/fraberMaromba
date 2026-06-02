"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProfessorDashboard } from "@/hooks/useProfessorDashboard";
import { DashboardHeader } from "@/components/professor/DashboardHeader";
import { ResumoAlunos } from "@/components/professor/ResumoAlunos";
import { BuscaAlunos } from "@/components/professor/BuscaAlunos";
import { AlunoCard } from "@/components/professor/AlunoCard";
import { FABActions } from "@/components/professor/FABActions";
import { GerarConviteButton } from "@/components/professor/GerarConviteButton";

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
    <section
      style={{
        backgroundColor: "#132035",
        border: "1px solid #1E3050",
        borderRadius: "12px",
        padding: "16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ margin: 0, color: "#7A9CC4", fontSize: "0.95rem" }}>Presenças Hoje</p>
      <strong
        style={{
          marginTop: "8px",
          display: "inline-block",
          color: "#2E7FD9",
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
  const { alunosFiltrados, termoBusca, setTermoBusca, loading, erro, totalAlunos } =
    useProfessorDashboard();
  const [presencasHoje, setPresencasHoje] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;

    const carregarPresencas = async (): Promise<void> => {
      const { dataInicio, dataFim } = intervaloHoje();
      const params = new URLSearchParams({ dataInicio, dataFim });

      try {
        const res = await fetch(`/api/professor/checkins?${params.toString()}`);
        if (!res.ok || !ativo) return;

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
    <main
      style={{
        backgroundColor: "#0D1B2E",
        minHeight: "100vh",
        padding: "1.5rem 1rem 6rem",
      }}
    >
      <style>{`
        .dashboard-resumo-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
          .dashboard-resumo-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
      <div
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          display: "grid",
          gap: "1rem",
        }}
      >
        <DashboardHeader nome={session?.user?.name ?? ""} />
        <GerarConviteButton professorId={session?.user?.id ?? ""} />
        <div className="dashboard-resumo-grid">
          <ResumoAlunos total={totalAlunos} />
          <PresencasHojeCard total={presencasHoje} />
        </div>
        <BuscaAlunos valor={termoBusca} onChange={setTermoBusca} />

        {loading ? (
          <p style={{ color: "#7A9CC4", textAlign: "center", margin: "2rem 0" }}>
            Carregando...
          </p>
        ) : erro ? (
          <p style={{ color: "#E8001C", textAlign: "center", margin: "2rem 0" }}>
            {erro}
          </p>
        ) : alunosFiltrados.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {alunosFiltrados.map((aluno) => (
              <AlunoCard key={aluno.id} aluno={aluno} nomePlano={aluno.planoId} />
            ))}
          </div>
        ) : (
          <p style={{ color: "#7A9CC4", textAlign: "center", margin: "2rem 0" }}>
            {termoBusca.trim()
              ? "Nenhum aluno encontrado."
              : "Você ainda não cadastrou nenhum aluno."}
          </p>
        )}
      </div>

      <FABActions
        onCadastrar={() => router.push("/professor/alunos/novo")}
        onCriarTreino={() => router.push("/professor/treinos")}
      />
    </main>
  );
}
