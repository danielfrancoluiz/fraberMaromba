"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useTreinosTemplate } from "@/hooks/useTreinosTemplate";
import { TemplateCard } from "@/components/professor/TemplateCard";
import { TreinoAtribuidoCard } from "@/components/professor/TreinoAtribuidoCard";
import { AtribuirTemplateModal } from "@/components/professor/AtribuirTemplateModal";
import { EditarTemplateModal } from "@/components/professor/EditarTemplateModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TreinoComAluno, TreinoTemplate } from "@/types";
import {
  atualizarTemplate,
  deletarTemplate,
  deletarTreino,
  listarTreinosProfessor,
} from "@/services/professorService";

type AbaTreinos = "templates" | "atribuidos";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const { templates, loading, erro, recarregar } = useTreinosTemplate();
  const [aba, setAba] = useState<AbaTreinos>("atribuidos");
  const [treinosAtribuidos, setTreinosAtribuidos] = useState<TreinoComAluno[]>([]);
  const [loadingAtribuidos, setLoadingAtribuidos] = useState(true);
  const [erroAtribuidos, setErroAtribuidos] = useState<string | null>(null);

  const [templateAtribuir, setTemplateAtribuir] = useState<TreinoTemplate | null>(null);
  const [templateEditar, setTemplateEditar] = useState<TreinoTemplate | null>(null);
  const [templateExcluir, setTemplateExcluir] = useState<TreinoTemplate | null>(null);
  const [treinoExcluir, setTreinoExcluir] = useState<TreinoComAluno | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const professorId = session?.user?.id ?? "";

  const carregarAtribuidos = useCallback(async () => {
    setLoadingAtribuidos(true);
    setErroAtribuidos(null);
    try {
      const lista = await listarTreinosProfessor();
      setTreinosAtribuidos(lista);
    } catch (error) {
      setErroAtribuidos(
        error instanceof Error ? error.message : "Erro ao carregar treinos"
      );
      setTreinosAtribuidos([]);
    } finally {
      setLoadingAtribuidos(false);
    }
  }, []);

  useEffect(() => {
    void carregarAtribuidos();
  }, [carregarAtribuidos]);

  function handleAbrirEditar(template: TreinoTemplate) {
    setTemplateAtribuir(null);
    setTemplateExcluir(null);
    setTemplateEditar(template);
  }

  function handleAbrirAtribuir(template: TreinoTemplate) {
    setTemplateEditar(null);
    setTemplateExcluir(null);
    setTemplateAtribuir(template);
  }

  function handleSolicitarExclusaoTemplate(template: TreinoTemplate) {
    setTemplateEditar(null);
    setTemplateAtribuir(null);
    setTemplateExcluir(template);
  }

  async function handleConfirmarExclusaoTemplate() {
    if (!templateExcluir) return;
    setExcluindo(true);
    try {
      await deletarTemplate(templateExcluir.id);
      setTemplateExcluir(null);
      recarregar();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir template");
    } finally {
      setExcluindo(false);
    }
  }

  async function handleConfirmarExclusaoTreino() {
    if (!treinoExcluir) return;
    setExcluindo(true);
    try {
      await deletarTreino(treinoExcluir.id);
      setTreinoExcluir(null);
      await carregarAtribuidos();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir treino");
    } finally {
      setExcluindo(false);
    }
  }

  async function handleSalvarEdicao(dados: {
    nome: string;
    descricao: string;
    exercicios: TreinoTemplate["exercicios"];
  }) {
    if (!templateEditar) return;
    await atualizarTemplate(templateEditar.id, dados);
    setTemplateEditar(null);
    recarregar();
  }

  const loadingConteudo =
    aba === "templates" ? loading : loadingAtribuidos;
  const erroConteudo = aba === "templates" ? erro : erroAtribuidos;

  return (
    <main className="page-main">
      <div className="page-container">
        <header style={{ paddingTop: "1rem", marginBottom: "0.75rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Treinos</h1>
          <p className="text-muted" style={{ margin: "4px 0 0" }}>
            Templates reutilizáveis e treinos dos alunos
          </p>
        </header>

        <div className="treinos-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={aba === "atribuidos"}
            className={`treinos-tab${aba === "atribuidos" ? " treinos-tab--active" : ""}`}
            onClick={() => setAba("atribuidos")}
          >
            Atribuídos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === "templates"}
            className={`treinos-tab${aba === "templates" ? " treinos-tab--active" : ""}`}
            onClick={() => setAba("templates")}
          >
            Templates
          </button>
        </div>

        {loadingConteudo ? (
          <p className="text-muted" style={{ margin: "2rem 0", textAlign: "center" }}>
            Carregando...
          </p>
        ) : erroConteudo ? (
          <p className="text-accent" style={{ margin: "2rem 0", textAlign: "center" }}>
            {erroConteudo}
          </p>
        ) : aba === "templates" ? (
          templates.length === 0 ? (
            <p className="text-muted" style={{ margin: "2rem 0", textAlign: "center" }}>
              Nenhum template criado ainda.
            </p>
          ) : (
            <div className="templates-grid">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onAtribuir={handleAbrirAtribuir}
                  onEditar={handleAbrirEditar}
                  onSolicitarExclusao={handleSolicitarExclusaoTemplate}
                />
              ))}
            </div>
          )
        ) : treinosAtribuidos.length === 0 ? (
          <p className="text-muted" style={{ margin: "2rem 0", textAlign: "center" }}>
            Nenhum treino atribuído ainda. Use &quot;Novo treino&quot; para montar um plano.
          </p>
        ) : (
          <div className="treinos-atribuidos-grid">
            {treinosAtribuidos.map((treino) => (
              <TreinoAtribuidoCard
                key={treino.id}
                treino={treino}
                onEditar={(t) =>
                  router.push(`/professor/treinos/montar/${t.id}`)
                }
                onExcluir={setTreinoExcluir}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/professor/treinos/montar")}
        className="btn-primary fab-above-nav"
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
        Novo treino
      </button>

      <button
        type="button"
        onClick={() => router.push("/professor/treinos/novo")}
        className="chip fab-template-secondary"
        style={{
          position: "fixed",
          right: "16px",
          bottom: "80px",
          borderRadius: "9999px",
          padding: "8px 14px",
          fontSize: "0.8rem",
        }}
      >
        Novo template
      </button>

      {templateAtribuir && professorId ? (
        <AtribuirTemplateModal
          key={`atribuir-${templateAtribuir.id}`}
          template={templateAtribuir}
          professorId={professorId}
          onFechar={() => setTemplateAtribuir(null)}
          onSucesso={() => {
            setTemplateAtribuir(null);
            recarregar();
            void carregarAtribuidos();
          }}
        />
      ) : null}

      {templateEditar ? (
        <EditarTemplateModal
          key={templateEditar.id}
          template={templateEditar}
          onFechar={() => setTemplateEditar(null)}
          onSalvar={handleSalvarEdicao}
        />
      ) : null}

      <ConfirmDialog
        open={!!templateExcluir}
        titulo="Excluir template?"
        mensagem={
          templateExcluir
            ? `Tem certeza que deseja excluir o template "${templateExcluir.nome}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        loading={excluindo}
        onConfirmar={() => void handleConfirmarExclusaoTemplate()}
        onCancelar={() => !excluindo && setTemplateExcluir(null)}
      />

      <ConfirmDialog
        open={!!treinoExcluir}
        titulo="Excluir treino?"
        mensagem={
          treinoExcluir
            ? `Excluir o treino "${treinoExcluir.nome}" de ${treinoExcluir.alunoNome ?? "aluno"}? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        loading={excluindo}
        onConfirmar={() => void handleConfirmarExclusaoTreino()}
        onCancelar={() => !excluindo && setTreinoExcluir(null)}
      />

      <style jsx global>{`
        .treinos-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 1rem;
          padding: 4px;
          background: var(--fraber-surface, #132035);
          border-radius: 12px;
          border: 1px solid var(--fraber-border, #1e3050);
        }
        .treinos-tab {
          flex: 1;
          min-height: 40px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--fraber-text-muted, #7a9cc4);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: Inter, sans-serif;
        }
        .treinos-tab--active {
          background: var(--fraber-primary, #2e7fd9);
          color: #f0f4ff;
        }
        .treinos-atribuidos-grid {
          display: grid;
          gap: 12px;
        }
        .treino-atribuido-card {
          padding: 14px 16px;
        }
        .treino-atribuido-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .treino-atribuido-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .treino-atribuido-nome {
          margin: 0;
          font-size: 1rem;
        }
        .treino-atribuido-dia {
          flex-shrink: 0;
          background: var(--fraber-primary, #2e7fd9);
          color: #f0f4ff;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .treino-atribuido-aluno {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 6px;
          font-size: 0.9rem;
          color: var(--fraber-text, #f0f4ff);
        }
        .treino-atribuido-meta,
        .treino-atribuido-desc {
          margin: 0;
          font-size: 0.85rem;
        }
        .treino-atribuido-acoes {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .chip--danger {
          border-color: var(--fraber-secondary, #e8001c);
          color: var(--fraber-secondary, #e8001c);
        }
        @media (min-width: 640px) {
          .treinos-atribuidos-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </main>
  );
}
