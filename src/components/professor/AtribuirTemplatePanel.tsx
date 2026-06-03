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

const colors = {
  background: "#0D1B2E",
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

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
        style={{
          width: "100%",
          textAlign: "left",
          border: `1px solid ${selecionado ? colors.primary : colors.border}`,
          backgroundColor: selecionado ? "#1a2d45" : colors.surface,
          color: colors.textPrimary,
          borderRadius: "10px",
          padding: "12px",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          display: "grid",
          gap: "4px",
        }}
      >
        <strong style={{ fontSize: "0.95rem" }}>{template.nome}</strong>
        <span style={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
          {template.exercicios.length} exercício(s)
        </span>
      </button>
    );
  };

  return (
    <section className="atp-section" style={{ backgroundColor: colors.background }}>
      <div className="atp-container">
        <div className="atp-panel">
          <h3
            style={{
              margin: 0,
              color: colors.textPrimary,
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ClipboardList size={18} color={colors.primary} />
            Atribuir Template
          </h3>

          {loadingTemplates ? (
            <p style={{ margin: 0, color: colors.textSecondary }}>Carregando templates...</p>
          ) : templates.length === 0 ? (
            <div style={{ display: "grid", gap: "10px" }}>
              <p style={{ margin: 0, color: colors.textSecondary }}>
                Nenhum template criado ainda.
              </p>
              <button
                type="button"
                onClick={() => router.push("/professor/treinos")}
                style={{
                  minHeight: "40px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: colors.primary,
                  color: colors.textPrimary,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  width: "fit-content",
                  padding: "8px 12px",
                }}
              >
                Ir para templates
              </button>
            </div>
          ) : (
            <>
              <div className="atp-template-lista">{templates.map(renderTemplateItem)}</div>

              <div>
                <label className="atp-label">Dia da Semana</label>
                <select
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
                  className="atp-select"
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
            <p style={{ margin: 0, color: colors.secondary, fontSize: "0.9rem" }}>
              {feedbackErro}
            </p>
          ) : null}

          <div className="atp-acoes">
            <button type="button" onClick={onCancelar} className="atp-cancelar-btn">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleAtribuir()}
              className="atp-submit-btn"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Atribuindo..." : "Atribuir Treino"}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .atp-section {
          width: 100%;
          padding: 1rem;
          font-family: Inter, sans-serif;
        }
        .atp-container {
          width: 100%;
        }
        .atp-panel {
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: 12px;
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .atp-template-lista {
          display: grid;
          gap: 10px;
        }
        .atp-label {
          color: ${colors.textSecondary};
          margin-bottom: 6px;
          font-size: 0.9rem;
          display: block;
        }
        .atp-select {
          min-height: 48px;
          width: 100%;
          border-radius: 10px;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          color: ${colors.textPrimary};
          padding: 10px 12px;
          font-family: Inter, sans-serif;
          font-size: 0.95rem;
        }
        .atp-acoes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .atp-cancelar-btn,
        .atp-submit-btn {
          min-height: 48px;
          border-radius: 10px;
          font-family: Inter, sans-serif;
          font-weight: 700;
          cursor: pointer;
        }
        .atp-cancelar-btn {
          border: 1px solid ${colors.border};
          background: transparent;
          color: ${colors.textPrimary};
        }
        .atp-submit-btn {
          border: none;
          background: ${colors.primary};
          color: ${colors.textPrimary};
        }
        .atp-submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }
        @media (min-width: 768px) {
          .atp-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .atp-section {
            padding: 1.5rem 2rem;
          }
        }
        @media (min-width: 1024px) {
          .atp-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .atp-section {
            padding: 2rem 3rem;
          }
        }
      `}</style>
    </section>
  );
}
