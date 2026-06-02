"use client";

import { Aluno } from "@/types";
import { useEditarAluno } from "@/hooks/useEditarAluno";

interface EditarAlunoFormProps {
  aluno: Aluno;
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

export function EditarAlunoForm({
  aluno,
  onCancelar,
  onSucesso,
}: EditarAlunoFormProps) {
  const {
    form,
    errors,
    planos,
    loadingPlanos,
    loadingSubmit,
    feedbackSucesso,
    feedbackErro,
    handleChange,
    handleSubmit,
  } = useEditarAluno(aluno, onSucesso);

  const inputStyle = {
    minHeight: "48px",
    width: "100%",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    padding: "10px 12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.95rem",
  };

  const labelStyle = {
    color: colors.textSecondary,
    marginBottom: "6px",
    fontSize: "0.9rem",
    fontFamily: "Inter, sans-serif",
    display: "block",
  };

  return (
    <section
      className="editar-aluno-section"
      style={{ backgroundColor: colors.background, color: colors.textPrimary }}
    >
      <div className="editar-aluno-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="editar-aluno-grid"
        >
          <div className="span-2">
            <label style={labelStyle}>Nome Completo</label>
            <input
              value={form.nomeCompleto}
              onChange={(e) => handleChange("nomeCompleto", e.target.value)}
              style={inputStyle}
            />
            {errors.nomeCompleto ? (
              <p className="erro-campo">{errors.nomeCompleto}</p>
            ) : null}
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={inputStyle}
            />
            {errors.email ? <p className="erro-campo">{errors.email}</p> : null}
          </div>

          <div>
            <label style={labelStyle}>Telefone</label>
            <input
              value={form.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              style={inputStyle}
            />
            {errors.telefone ? (
              <p className="erro-campo">{errors.telefone}</p>
            ) : null}
          </div>

          <div>
            <label style={labelStyle}>Peso (kg)</label>
            <input
              value={form.peso}
              onChange={(e) => handleChange("peso", e.target.value)}
              style={inputStyle}
            />
            {errors.peso ? <p className="erro-campo">{errors.peso}</p> : null}
          </div>

          <div>
            <label style={labelStyle}>Altura (cm)</label>
            <input
              value={form.altura}
              onChange={(e) => handleChange("altura", e.target.value)}
              style={inputStyle}
            />
            {errors.altura ? <p className="erro-campo">{errors.altura}</p> : null}
          </div>

          <div>
            <label style={labelStyle}>CPF</label>
            <div className="readonly-campo">{aluno.cpf}</div>
          </div>

          <div>
            <label style={labelStyle}>Sexo</label>
            <div className="readonly-campo">{aluno.sexo}</div>
          </div>

          <div className="span-2">
            <label style={labelStyle}>Data de Nascimento</label>
            <div className="readonly-campo">
              {new Date(`${aluno.dataNascimento}T00:00:00`).toLocaleDateString("pt-BR")}
            </div>
          </div>

          <div className="span-2">
            <label style={labelStyle}>Objetivo</label>
            <textarea
              rows={3}
              value={form.objetivo}
              onChange={(e) => handleChange("objetivo", e.target.value)}
              style={{ ...inputStyle, minHeight: "96px", resize: "vertical" }}
            />
            {errors.objetivo ? (
              <p className="erro-campo">{errors.objetivo}</p>
            ) : null}
          </div>

          <div className="span-2">
            <label style={labelStyle}>Plano</label>
            <select
              value={form.planoId}
              onChange={(e) => handleChange("planoId", e.target.value)}
              style={inputStyle}
            >
              <option value="">
                {loadingPlanos ? "Carregando planos..." : "Selecione um plano"}
              </option>
              {!loadingPlanos &&
                planos.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome}
                  </option>
                ))}
            </select>
            {errors.planoId ? <p className="erro-campo">{errors.planoId}</p> : null}
          </div>

          {feedbackSucesso ? (
            <p className="span-2" style={{ margin: 0, color: colors.primary }}>
              Dados atualizados com sucesso!
            </p>
          ) : null}
          {feedbackErro ? (
            <p className="span-2" style={{ margin: 0, color: colors.secondary }}>
              {feedbackErro}
            </p>
          ) : null}

          <div className="span-2 acoes">
            <button type="button" className="botao-cancelar" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="botao-salvar" disabled={loadingSubmit}>
              {loadingSubmit ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .editar-aluno-section {
          width: 100%;
          padding: 1rem;
          font-family: Inter, sans-serif;
        }
        .editar-aluno-container {
          width: 100%;
        }
        .editar-aluno-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .readonly-campo {
          min-height: 48px;
          width: 100%;
          border-radius: 10px;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          color: ${colors.textPrimary};
          padding: 12px;
          display: flex;
          align-items: center;
        }
        .erro-campo {
          margin: 6px 0 0;
          color: ${colors.secondary};
          font-size: 0.85rem;
        }
        .acoes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .botao-cancelar,
        .botao-salvar {
          min-height: 48px;
          border-radius: 10px;
          font-family: Inter, sans-serif;
          font-weight: 700;
          cursor: pointer;
        }
        .botao-cancelar {
          border: 1px solid ${colors.border};
          background: transparent;
          color: ${colors.textPrimary};
        }
        .botao-salvar {
          border: none;
          background: ${colors.primary};
          color: ${colors.textPrimary};
        }
        @media (min-width: 768px) {
          .editar-aluno-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .editar-aluno-section {
            padding: 1.5rem 2rem;
          }
        }
        @media (min-width: 1024px) {
          .editar-aluno-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .editar-aluno-section {
            padding: 2rem 3rem;
          }
          .editar-aluno-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 1rem;
            row-gap: 14px;
          }
          .span-2 {
            grid-column: span 2;
          }
        }
      `}</style>
    </section>
  );
}
