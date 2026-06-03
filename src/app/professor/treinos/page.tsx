"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTreinosTemplate } from "@/hooks/useTreinosTemplate";
import { TemplateCard } from "@/components/professor/TemplateCard";
import { AtribuirTemplateModal } from "@/components/professor/AtribuirTemplateModal";
import { EditarTemplateModal } from "@/components/professor/EditarTemplateModal";
import { LogoutButton } from "@/components/LogoutButton";
import { TreinoTemplate } from "@/types";
import { atualizarTemplate, deletarTemplate } from "@/services/professorService";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const { templates, loading, erro, recarregar } = useTreinosTemplate();
  const [templateAtribuir, setTemplateAtribuir] = useState<TreinoTemplate | null>(null);
  const [templateEditar, setTemplateEditar] = useState<TreinoTemplate | null>(null);

  const professorId = session?.user?.id ?? "";

  async function handleExcluir(template: TreinoTemplate) {
    try {
      await deletarTemplate(template.id);
      recarregar();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir template");
    }
  }

  async function handleSalvarEdicao(dados: {
    nome: string;
    descricao: string;
    exercicios: TreinoTemplate["exercicios"];
  }) {
    if (!templateEditar) return;
    await atualizarTemplate(templateEditar.id, dados);
    recarregar();
  }

  return (
    <main className="page-main">
      <div className="page-container">
        <header style={{ display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <button
              type="button"
              onClick={() => router.push("/professor/dashboard")}
              className="chip"
              style={{ minHeight: "40px", minWidth: "40px", padding: "8px" }}
              aria-label="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <LogoutButton />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Meus Templates</h1>
            <p className="text-muted" style={{ margin: "4px 0 0" }}>
              Treinos reutilizáveis
            </p>
          </div>
        </header>

        {loading ? (
          <p className="text-muted" style={{ margin: "2rem 0", textAlign: "center" }}>
            Carregando...
          </p>
        ) : erro ? (
          <p className="text-accent" style={{ margin: "2rem 0", textAlign: "center" }}>
            {erro}
          </p>
        ) : templates.length === 0 ? (
          <p className="text-muted" style={{ margin: "2rem 0", textAlign: "center" }}>
            Nenhum template criado ainda.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
            }}
            className="templates-grid"
          >
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onAtribuir={setTemplateAtribuir}
                onEditar={setTemplateEditar}
                onExcluir={(t) => void handleExcluir(t)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/professor/treinos/novo")}
        className="btn-primary"
        style={{
          position: "fixed",
          right: "16px",
          bottom: "24px",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.28)",
        }}
      >
        <Plus size={18} />
        Novo Template
      </button>

      {templateAtribuir && professorId ? (
        <AtribuirTemplateModal
          template={templateAtribuir}
          professorId={professorId}
          onFechar={() => setTemplateAtribuir(null)}
          onSucesso={() => recarregar()}
        />
      ) : null}

      {templateEditar ? (
        <EditarTemplateModal
          template={templateEditar}
          onFechar={() => setTemplateEditar(null)}
          onSalvar={handleSalvarEdicao}
        />
      ) : null}

      <style jsx global>{`
        @media (min-width: 768px) {
          .templates-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 1024px) {
          .templates-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </main>
  );
}
