"use client";

import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAtribuirTemplate } from "@/hooks/useAtribuirTemplate";
import { TreinoTemplate } from "@/types";

interface AtribuirTemplatePanelProps {
  alunoId: string;
  onCancelar: () => void;
  onSucesso: () => void;
}

export function AtribuirTemplatePanel({
  alunoId,
  onCancelar,
  onSucesso,
}: AtribuirTemplatePanelProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const professorId = session?.user?.id ?? "";
  const {
    templates,
    loadingTemplates,
    templateSelecionado,
    setTemplateSelecionado,
    diaSemana,
    setDiaSemana,
    loadingSubmit,
    feedbackErro,
    handleAtribuir,
  } = useAtribuirTemplate(alunoId, professorId, onSucesso);

  const renderTemplateItem = (template: TreinoTemplate) => {
    const selecionado = templateSelecionado?.id === template.id;
    return (
      <button
        key={template.id}
        type="button"
        onClick={() => setTemplateSelecionado(template)}
        className={`template-picker-item${selecionado ? " template-picker-item--selected" : ""}`}
      >
        <strong>{template.nome}</strong>
        <span>
          {template.exercicios.length} exercício
          {template.exercicios.length !== 1 ? "s" : ""}
        </span>
      </button>
    );
  };

  return (
    <div className="card page-stack" style={{ gap: "12px" }}>
      <h3 className="form-section-title section-title-icon">
        <ClipboardList size={18} />
        Atribuir template
      </h3>

      {loadingTemplates ? (
        <p className="text-muted" style={{ margin: 0 }}>
          Carregando templates...
        </p>
      ) : templates.length === 0 ? (
        <div className="page-stack" style={{ gap: "10px" }}>
          <p className="text-muted" style={{ margin: 0 }}>
            Nenhum template criado ainda.
          </p>
          <button
            type="button"
            className="btn-primary btn-compact"
            style={{ width: "fit-content" }}
            onClick={() => router.push("/professor/treinos")}
          >
            Ir para templates
          </button>
        </div>
      ) : (
        <>
          <div className="template-picker-list">{templates.map(renderTemplateItem)}</div>

          <div>
            <label className="field-label" htmlFor="atribuir-dia">
              Dia da semana
            </label>
            <select
              id="atribuir-dia"
              className="input-field"
              value={diaSemana}
              onChange={(e) =>
                setDiaSemana(
                  e.target.value as
                    | ""
                    | "segunda"
                    | "terca"
                    | "quarta"
                    | "quinta"
                    | "sexta"
                    | "sabado"
                    | "domingo"
                )
              }
            >
              <option value="">Selecione</option>
              <option value="segunda">Segunda</option>
              <option value="terca">Terça</option>
              <option value="quarta">Quarta</option>
              <option value="quinta">Quinta</option>
              <option value="sexta">Sexta</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>
          </div>
        </>
      )}

      {feedbackErro ? (
        <p className="field-error" style={{ margin: 0 }}>
          {feedbackErro}
        </p>
      ) : null}

      <div className="form-actions">
        <button type="button" onClick={onCancelar} className="btn-secondary">
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void handleAtribuir()}
          className="btn-primary"
          disabled={loadingSubmit || templates.length === 0}
        >
          {loadingSubmit ? "Atribuindo..." : "Atribuir treino"}
        </button>
      </div>
    </div>
  );
}
