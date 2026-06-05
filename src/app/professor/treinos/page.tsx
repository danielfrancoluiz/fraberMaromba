"use client";

import { Dumbbell, Plus } from "lucide-react";
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
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

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

  const loadingConteudo = aba === "templates" ? loading : loadingAtribuidos;
  const erroConteudo = aba === "templates" ? erro : erroAtribuidos;

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageHeader
          title="Treinos"
          subtitle="Templates reutilizáveis e treinos dos alunos"
        />

        <div className="tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={aba === "atribuidos"}
            className={`tab-btn${aba === "atribuidos" ? " tab-btn--active" : ""}`}
            onClick={() => setAba("atribuidos")}
          >
            Atribuídos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === "templates"}
            className={`tab-btn${aba === "templates" ? " tab-btn--active" : ""}`}
            onClick={() => setAba("templates")}
          >
            Templates
          </button>
        </div>

        {loadingConteudo ? (
          <p className="loading-center text-muted">Carregando...</p>
        ) : erroConteudo ? (
          <p className="error-center text-accent">{erroConteudo}</p>
        ) : aba === "templates" ? (
          templates.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Nenhum template criado"
              description="Crie um template para reutilizar em vários alunos."
              action={
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => router.push("/professor/treinos/novo")}
                >
                  Novo template
                </button>
              }
            />
          ) : (
            <div className="templates-grid">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onAtribuir={setTemplateAtribuir}
                  onEditar={setTemplateEditar}
                  onSolicitarExclusao={setTemplateExcluir}
                />
              ))}
            </div>
          )
        ) : treinosAtribuidos.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="Nenhum treino atribuído"
            description='Use "Novo treino" para montar um plano personalizado.'
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={() => router.push("/professor/treinos/montar")}
              >
                Montar treino
              </button>
            }
          />
        ) : (
          <div className="treinos-grid">
            {treinosAtribuidos.map((treino) => (
              <TreinoAtribuidoCard
                key={treino.id}
                treino={treino}
                onEditar={(t) => router.push(`/professor/treinos/montar/${t.id}`)}
                onExcluir={setTreinoExcluir}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/professor/treinos/montar")}
        className="fab-primary"
      >
        <Plus size={18} />
        Novo treino
      </button>

      <button
        type="button"
        onClick={() => router.push("/professor/treinos/novo")}
        className="fab-secondary chip"
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
            ? `Tem certeza que deseja excluir o template "${templateExcluir.nome}"?`
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
            ? `Excluir o treino "${treinoExcluir.nome}" de ${treinoExcluir.alunoNome ?? "aluno"}?`
            : ""
        }
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        loading={excluindo}
        onConfirmar={() => void handleConfirmarExclusaoTreino()}
        onCancelar={() => !excluindo && setTreinoExcluir(null)}
      />
    </main>
  );
}
