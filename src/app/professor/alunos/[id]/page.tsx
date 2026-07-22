"use client";

import { ClipboardList, Dumbbell, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAlunoDetalhes } from "@/hooks/useAlunoDetalhes";
import { MedicaoFisica } from "@/hooks/useMedicoes";
import { AlunoDetalhesHeader } from "@/components/professor/AlunoDetalhesHeader";
import { AlunoInfoCard } from "@/components/professor/AlunoInfoCard";
import { EditarAlunoForm } from "@/components/professor/EditarAlunoForm";
import { TreinoCard } from "@/components/professor/TreinoCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { deletarAluno, deletarTreino } from "@/services/professorService";
import { Treino } from "@/types";
import { AtribuirTemplatePanel } from "@/components/professor/AtribuirTemplatePanel";
import { MedicaoForm } from "@/components/professor/MedicaoForm";
import { GraficoEvolucao } from "@/components/professor/GraficoEvolucao";
import { HistoricoCheckins } from "@/components/professor/HistoricoCheckins";
import { PagamentoCard } from "@/components/professor/PagamentoCard";
import { buscarEstatisticasSessaoAlunoProfessor } from "@/services/sessaoService";
import { EstatisticasSessaoProfessor } from "@/types";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { labelPlano } from "@/lib/planos-pagamento";

function isMedicaoFisica(value: unknown): value is MedicaoFisica {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.id === "string" &&
    typeof dados.alunoId === "string" &&
    typeof dados.dataMedicao === "string"
  );
}

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { aluno, treinos, loading, erro, recarregar } = useAlunoDetalhes(id);

  const [showEditarForm, setShowEditarForm] = useState(false);
  const [showAtribuirTemplate, setShowAtribuirTemplate] = useState(false);
  const [treinoExcluir, setTreinoExcluir] = useState<Treino | null>(null);
  const [excluindoTreino, setExcluindoTreino] = useState(false);
  const [confirmarExclusaoAluno, setConfirmarExclusaoAluno] = useState(false);
  const [excluindoAluno, setExcluindoAluno] = useState(false);
  const [medicoes, setMedicoes] = useState<MedicaoFisica[]>([]);
  const [statsSessoes, setStatsSessoes] = useState<EstatisticasSessaoProfessor | null>(
    null
  );

  const carregarMedicoes = useCallback(async (): Promise<void> => {
    if (!id) return;

    try {
      const res = await fetch(
        `/api/professor/medicoes?alunoId=${encodeURIComponent(id)}`
      );
      if (!res.ok) return;

      const dados: unknown = await res.json();
      if (Array.isArray(dados)) {
        setMedicoes(dados.filter(isMedicaoFisica));
      }
    } catch {
      setMedicoes([]);
    }
  }, [id]);

  useEffect(() => {
    void carregarMedicoes();
  }, [carregarMedicoes]);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    void buscarEstatisticasSessaoAlunoProfessor(id)
      .then((d) => {
        if (ativo) setStatsSessoes(d);
      })
      .catch(() => {
        if (ativo) setStatsSessoes(null);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="page-main">
        <p className="loading-center text-muted">Carregando...</p>
      </main>
    );
  }

  if (erro || !aluno) {
    return (
      <main className="page-main">
        <div className="status-page-inner">
          <p>Aluno não encontrado.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/professor/dashboard")}
          >
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const nomePlano = labelPlano(aluno.planoId);

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <AlunoDetalhesHeader
          aluno={aluno}
          onVoltar={() => router.push("/professor/alunos")}
          onEditar={() => {
            setShowEditarForm(true);
            setShowAtribuirTemplate(false);
          }}
          onExcluir={() => setConfirmarExclusaoAluno(true)}
        />

        {showEditarForm ? (
          <EditarAlunoForm
            aluno={aluno}
            onCancelar={() => setShowEditarForm(false)}
            onSucesso={() => {
              setShowEditarForm(false);
              recarregar();
            }}
          />
        ) : (
          <AlunoInfoCard aluno={aluno} nomePlano={nomePlano} />
        )}

        <div className="stats-row">
          <article className="stat-tile">
            <p className="stat-tile-value">{statsSessoes?.treinosConcluidos ?? 0}</p>
            <p className="stat-tile-label">Treinos concluídos</p>
          </article>
          <article className="stat-tile">
            <p className="stat-tile-value">{statsSessoes?.minutosTotais ?? 0} min</p>
            <p className="stat-tile-label">Minutos treinados</p>
          </article>
        </div>

        <section className="page-section card">
          <div className="section-title-row">
            <h2 className="section-title section-title-icon">
              <Dumbbell size={18} />
              Treinos
            </h2>
            <div className="action-row" style={{ flex: "none" }}>
              <button
                type="button"
                className="btn-primary btn-compact"
                onClick={() => {
                  setShowAtribuirTemplate(true);
                  setShowEditarForm(false);
                }}
              >
                <ClipboardList size={16} />
                Usar template
              </button>
              <button
                type="button"
                className="btn-secondary btn-compact"
                onClick={() =>
                  router.push(
                    `/professor/treinos/montar?alunoId=${encodeURIComponent(aluno.id)}`
                  )
                }
              >
                <Plus size={16} />
                Montar treino
              </button>
            </div>
          </div>

          {showAtribuirTemplate ? (
            <AtribuirTemplatePanel
              alunoId={aluno.id}
              onCancelar={() => setShowAtribuirTemplate(false)}
              onSucesso={() => {
                setShowAtribuirTemplate(false);
                recarregar();
              }}
            />
          ) : null}

          {treinos.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Nenhum treino cadastrado"
              description="Monte um treino personalizado ou use um template."
            />
          ) : (
            <div className="treinos-grid">
              {treinos.map((treino) => (
                <TreinoCard
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
        </section>

        <Section title="Evolução física" className="card">
          <MedicaoForm alunoId={aluno.id} onSalvo={carregarMedicoes} />
          <GraficoEvolucao medicoes={medicoes} />
        </Section>

        <Section title="Histórico de presenças" className="card">
          <HistoricoCheckins alunoId={aluno.id} />
        </Section>

        <Section title="Pagamento" className="card">
          <PagamentoCard
            alunoId={aluno.id}
            planoAtual={aluno.planoId}
            modulosAtuais={aluno.modulosAtivos ?? []}
          />
        </Section>
      </div>

      <ConfirmDialog
        open={confirmarExclusaoAluno}
        titulo="Excluir aluno?"
        mensagem={`Excluir "${aluno.nomeCompleto}" e todos os treinos, medições e histórico? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir aluno"
        cancelarLabel="Cancelar"
        loading={excluindoAluno}
        onConfirmar={async () => {
          setExcluindoAluno(true);
          try {
            await deletarAluno(aluno.id);
            setConfirmarExclusaoAluno(false);
            router.push("/professor/alunos");
          } catch (error) {
            alert(error instanceof Error ? error.message : "Erro ao excluir aluno");
          } finally {
            setExcluindoAluno(false);
          }
        }}
        onCancelar={() => !excluindoAluno && setConfirmarExclusaoAluno(false)}
      />

      <ConfirmDialog
        open={!!treinoExcluir}
        titulo="Excluir treino?"
        mensagem={
          treinoExcluir
            ? `Excluir o treino "${treinoExcluir.nome}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        loading={excluindoTreino}
        onConfirmar={async () => {
          if (!treinoExcluir) return;
          setExcluindoTreino(true);
          try {
            await deletarTreino(treinoExcluir.id);
            setTreinoExcluir(null);
            recarregar();
          } catch (error) {
            alert(error instanceof Error ? error.message : "Erro ao excluir treino");
          } finally {
            setExcluindoTreino(false);
          }
        }}
        onCancelar={() => !excluindoTreino && setTreinoExcluir(null)}
      />
    </main>
  );
}
