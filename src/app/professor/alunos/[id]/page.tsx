"use client";

import { ClipboardList, Dumbbell, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAlunoDetalhes } from "@/hooks/useAlunoDetalhes";
import { MedicaoFisica } from "@/hooks/useMedicoes";
import { AlunoDetalhesHeader } from "@/components/professor/AlunoDetalhesHeader";
import { AlunoInfoCard } from "@/components/professor/AlunoInfoCard";
import { EditarAlunoForm } from "@/components/professor/EditarAlunoForm";
import { TreinoCard } from "@/components/professor/TreinoCard";
import { CriarTreinoForm } from "@/components/professor/CriarTreinoForm";
import { AtribuirTemplatePanel } from "@/components/professor/AtribuirTemplatePanel";
import { MedicaoForm } from "@/components/professor/MedicaoForm";
import { GraficoEvolucao } from "@/components/professor/GraficoEvolucao";
import { HistoricoCheckins } from "@/components/professor/HistoricoCheckins";
import { PagamentoCard } from "@/components/professor/PagamentoCard";

const planosPadrao = [
  { id: "mensal", nome: "Mensal" },
  { id: "semestral", nome: "Semestral" },
  { id: "anual", nome: "Anual" },
  { id: "avulso", nome: "Avulso" },
  { id: "gympass", nome: "Gympass" },
];

function isMedicaoFisica(value: unknown): value is MedicaoFisica {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.id === "string" &&
    typeof dados.alunoId === "string" &&
    typeof dados.dataMedicao === "string"
  );
}

function SecaoTitulo({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        margin: "0 0 1rem",
        color: "#F0F4FF",
        fontSize: "1.1rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </h2>
  );
}

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { aluno, treinos, loading, erro, recarregar } = useAlunoDetalhes(id);

  const [showEditarForm, setShowEditarForm] = useState(false);
  const [showCriarTreino, setShowCriarTreino] = useState(false);
  const [showAtribuirTemplate, setShowAtribuirTemplate] = useState(false);
  const [medicoes, setMedicoes] = useState<MedicaoFisica[]>([]);

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

  if (loading) {
    return (
      <main
        style={{
          backgroundColor: "#0D1B2E",
          minHeight: "100vh",
          padding: "1.5rem 1rem 4rem",
          display: "grid",
          placeItems: "center",
          color: "#7A9CC4",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Carregando...
      </main>
    );
  }

  if (erro || !aluno) {
    return (
      <main
        style={{
          backgroundColor: "#0D1B2E",
          minHeight: "100vh",
          padding: "1.5rem 1rem 4rem",
          display: "grid",
          placeItems: "center",
          color: "#F0F4FF",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ margin: 0, marginBottom: "12px" }}>Aluno não encontrado.</p>
          <button
            type="button"
            onClick={() => router.push("/professor/dashboard")}
            style={{
              minHeight: "48px",
              borderRadius: "10px",
              border: "1px solid #1E3050",
              backgroundColor: "#132035",
              color: "#F0F4FF",
              padding: "0 16px",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const nomePlano =
    planosPadrao.find((plano) => plano.id === aluno.planoId)?.nome ?? aluno.planoId;

  return (
    <main
      style={{
        backgroundColor: "#0D1B2E",
        minHeight: "100vh",
        padding: "1.5rem 1rem 4rem",
      }}
    >
      <div
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          display: "grid",
          gap: "1rem",
        }}
      >
        <AlunoDetalhesHeader
          aluno={aluno}
          onVoltar={() => router.push("/professor/dashboard")}
          onEditar={() => {
            setShowEditarForm(true);
            setShowCriarTreino(false);
            setShowAtribuirTemplate(false);
          }}
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

        <section
          style={{
            backgroundColor: "#132035",
            border: "1px solid #1E3050",
            borderRadius: "12px",
            padding: "14px",
            fontFamily: "Inter, sans-serif",
            display: "grid",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#F0F4FF",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Dumbbell size={18} color="#2E7FD9" />
              Treinos
            </h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setShowAtribuirTemplate(true);
                  setShowCriarTreino(false);
                  setShowEditarForm(false);
                }}
                style={{
                  minHeight: "40px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#2E7FD9",
                  color: "#F0F4FF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ClipboardList size={16} />
                Usar Template
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCriarTreino(true);
                  setShowAtribuirTemplate(false);
                  setShowEditarForm(false);
                }}
                style={{
                  minHeight: "40px",
                  border: "1px solid #1E3050",
                  borderRadius: "10px",
                  backgroundColor: "#132035",
                  color: "#F0F4FF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Plus size={16} />
                Criar Personalizado
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

          {showCriarTreino ? (
            <CriarTreinoForm
              alunoId={aluno.id}
              onCancelar={() => setShowCriarTreino(false)}
              onSucesso={() => {
                setShowCriarTreino(false);
                recarregar();
              }}
            />
          ) : null}

          {treinos.length === 0 ? (
            <p style={{ margin: 0, color: "#7A9CC4" }}>
              Nenhum treino cadastrado ainda.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {treinos.map((treino) => (
                <TreinoCard key={treino.id} treino={treino} />
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            backgroundColor: "#132035",
            border: "1px solid #1E3050",
            borderRadius: "12px",
            padding: "14px",
            fontFamily: "Inter, sans-serif",
            display: "grid",
            gap: "12px",
          }}
        >
          <SecaoTitulo>Evolução Física</SecaoTitulo>
          <MedicaoForm alunoId={aluno.id} onSalvo={carregarMedicoes} />
          <GraficoEvolucao medicoes={medicoes} />
        </section>

        <section
          style={{
            backgroundColor: "#132035",
            border: "1px solid #1E3050",
            borderRadius: "12px",
            padding: "14px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <SecaoTitulo>Histórico de Presenças</SecaoTitulo>
          <HistoricoCheckins alunoId={aluno.id} />
        </section>

        <section
          style={{
            backgroundColor: "#132035",
            border: "1px solid #1E3050",
            borderRadius: "12px",
            padding: "14px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <SecaoTitulo>Pagamento</SecaoTitulo>
          <PagamentoCard alunoId={aluno.id} planoAtual={aluno.planoId} />
        </section>
      </div>
    </main>
  );
}
