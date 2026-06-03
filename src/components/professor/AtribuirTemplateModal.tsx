"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { Treino, TreinoTemplate, Aluno } from "@/types";
import { listarAlunos, atribuirTemplatePAraAluno } from "@/services/professorService";

const DIAS: Treino["diaSemana"][] = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

const DIA_LABELS: Record<Treino["diaSemana"], string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

interface AtribuirTemplateModalProps {
  template: TreinoTemplate;
  professorId: string;
  onFechar: () => void;
  onSucesso: () => void;
}

export function AtribuirTemplateModal({
  template,
  professorId,
  onFechar,
  onSucesso,
}: AtribuirTemplateModalProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [alunoId, setAlunoId] = useState("");
  const [diaSemana, setDiaSemana] = useState<Treino["diaSemana"] | "">("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarAlunos(professorId)
      .then((lista) => {
        if (ativo) setAlunos(lista);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar alunos");
      })
      .finally(() => {
        if (ativo) setLoadingAlunos(false);
      });
    return () => {
      ativo = false;
    };
  }, [professorId]);

  async function handleAtribuir() {
    if (!alunoId) {
      setErro("Selecione um aluno");
      return;
    }
    if (!diaSemana) {
      setErro("Selecione o dia da semana");
      return;
    }

    setLoading(true);
    setErro(null);
    try {
      await atribuirTemplatePAraAluno(template.id, alunoId, professorId, diaSemana);
      onSucesso();
      onFechar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao atribuir template");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalPortal>
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="atribuir-template-titulo"
      className="modal-overlay"
      onClick={onFechar}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: "440px", position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            border: "none",
            background: "transparent",
            color: "var(--fraber-text-muted)",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        <h2 id="atribuir-template-titulo" style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>
          Atribuir template
        </h2>
        <p className="text-muted" style={{ margin: "0 0 1rem", fontSize: "0.9rem" }}>
          {template.nome}
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <label className="text-muted" style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>
              Aluno
            </label>
            {loadingAlunos ? (
              <p className="text-muted" style={{ margin: 0 }}>Carregando alunos...</p>
            ) : alunos.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>Nenhum aluno cadastrado.</p>
            ) : (
              <select
                className="input-field"
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
              >
                <option value="">Selecione o aluno</option>
                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nomeCompleto}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-muted" style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>
              Dia da semana
            </label>
            <select
              className="input-field"
              value={diaSemana}
              onChange={(e) => setDiaSemana(e.target.value as Treino["diaSemana"])}
            >
              <option value="">Selecione o dia</option>
              {DIAS.map((dia) => (
                <option key={dia} value={dia}>
                  {DIA_LABELS[dia]}
                </option>
              ))}
            </select>
          </div>

          {erro ? (
            <p className="text-accent" style={{ margin: 0, fontSize: "0.875rem" }}>
              {erro}
            </p>
          ) : null}

          <button
            type="button"
            className="btn-primary"
            disabled={loading || loadingAlunos || alunos.length === 0}
            onClick={() => void handleAtribuir()}
          >
            {loading ? "Atribuindo..." : "Confirmar atribuição"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
