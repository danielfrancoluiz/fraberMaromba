"use client";

import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { useProfessorDashboard } from "@/hooks/useProfessorDashboard";
import { BuscaAlunos } from "@/components/professor/BuscaAlunos";
import { AlunoCard } from "@/components/professor/AlunoCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Page() {
  const router = useRouter();
  const { alunosFiltrados, termoBusca, setTermoBusca, loading, erro } =
    useProfessorDashboard();

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageHeader
          title="Alunos"
          subtitle={
            loading
              ? "Carregando..."
              : `${alunosFiltrados.length} cadastrado(s)`
          }
          action={
            <button
              type="button"
              className="btn-primary btn-compact"
              onClick={() => router.push("/professor/alunos/novo")}
            >
              <Plus size={16} />
              Novo
            </button>
          }
        />

        <BuscaAlunos valor={termoBusca} onChange={setTermoBusca} />

        {loading ? (
          <p className="loading-center text-muted">Carregando...</p>
        ) : erro ? (
          <p className="error-center text-accent">{erro}</p>
        ) : alunosFiltrados.length > 0 ? (
          <div className="alunos-grid">
            {alunosFiltrados.map((aluno) => (
              <AlunoCard key={aluno.id} aluno={aluno} nomePlano={aluno.planoId} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={
              termoBusca.trim()
                ? "Nenhum aluno encontrado"
                : "Nenhum aluno cadastrado"
            }
            description={
              termoBusca.trim()
                ? "Tente outro termo na busca."
                : "Cadastre seu primeiro aluno para começar."
            }
            action={
              !termoBusca.trim() ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => router.push("/professor/alunos/novo")}
                >
                  Cadastrar aluno
                </button>
              ) : undefined
            }
          />
        )}
      </div>
    </main>
  );
}
