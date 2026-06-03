"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useProfessorDashboard } from "@/hooks/useProfessorDashboard";
import { BuscaAlunos } from "@/components/professor/BuscaAlunos";
import { AlunoCard } from "@/components/professor/AlunoCard";

export default function Page() {
  const router = useRouter();
  const { alunosFiltrados, termoBusca, setTermoBusca, loading, erro } =
    useProfessorDashboard();

  return (
    <main className="page-main">
      <div className="page-container" style={{ paddingTop: "1rem" }}>
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Alunos</h1>
            <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
              {loading
                ? "Carregando..."
                : `${alunosFiltrados.length} cadastrado(s)`}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push("/professor/alunos/novo")}
            style={{
              minHeight: "40px",
              padding: "8px 12px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
            }}
          >
            <Plus size={16} />
            Novo
          </button>
        </header>

        <BuscaAlunos valor={termoBusca} onChange={setTermoBusca} />

        {loading ? (
          <p className="text-muted" style={{ textAlign: "center", margin: "2rem 0" }}>
            Carregando...
          </p>
        ) : erro ? (
          <p className="text-accent" style={{ textAlign: "center", margin: "2rem 0" }}>
            {erro}
          </p>
        ) : alunosFiltrados.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
            {alunosFiltrados.map((aluno) => (
              <AlunoCard key={aluno.id} aluno={aluno} nomePlano={aluno.planoId} />
            ))}
          </div>
        ) : (
          <p className="text-muted" style={{ textAlign: "center", margin: "2rem 0" }}>
            {termoBusca.trim()
              ? "Nenhum aluno encontrado para essa busca."
              : "Nenhum aluno cadastrado."}
          </p>
        )}
      </div>
    </main>
  );
}
