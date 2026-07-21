"use client";

import { Aluno } from "@/types";
import { useEditarAluno } from "@/hooks/useEditarAluno";

interface EditarAlunoFormProps {
  aluno: Aluno;
  onCancelar: () => void;
  onSucesso: () => void;
}

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

  return (
    <section className="card">
      <form
        className="form-grid form-grid--2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="field-span2">
          <label className="field-label" htmlFor="editar-nome">
            Nome completo
          </label>
          <input
            id="editar-nome"
            className="input-field"
            value={form.nomeCompleto}
            onChange={(e) => handleChange("nomeCompleto", e.target.value)}
          />
          {errors.nomeCompleto ? <p className="field-error">{errors.nomeCompleto}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="editar-email">
            Email
          </label>
          <input
            id="editar-email"
            className="input-field"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="editar-telefone">
            Telefone
          </label>
          <input
            id="editar-telefone"
            className="input-field"
            value={form.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
          />
          {errors.telefone ? <p className="field-error">{errors.telefone}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="editar-peso">
            Peso (kg)
          </label>
          <input
            id="editar-peso"
            className="input-field"
            value={form.peso}
            onChange={(e) => handleChange("peso", e.target.value)}
          />
          {errors.peso ? <p className="field-error">{errors.peso}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="editar-altura">
            Altura (cm)
          </label>
          <input
            id="editar-altura"
            className="input-field"
            value={form.altura}
            onChange={(e) => handleChange("altura", e.target.value)}
          />
          {errors.altura ? <p className="field-error">{errors.altura}</p> : null}
        </div>

        <div>
          <label className="field-label">CPF</label>
          <div className="readonly-field">{aluno.cpf}</div>
        </div>

        <div>
          <label className="field-label">Sexo</label>
          <div className="readonly-field">{aluno.sexo}</div>
        </div>

        <div className="field-span2">
          <label className="field-label">Data de nascimento</label>
          <div className="readonly-field">
            {new Date(`${aluno.dataNascimento}T00:00:00`).toLocaleDateString("pt-BR")}
          </div>
        </div>

        <div className="field-span2">
          <label className="field-label" htmlFor="editar-objetivo">
            Objetivo
          </label>
          <textarea
            id="editar-objetivo"
            rows={3}
            className="input-field textarea-field"
            value={form.objetivo}
            onChange={(e) => handleChange("objetivo", e.target.value)}
          />
          {errors.objetivo ? <p className="field-error">{errors.objetivo}</p> : null}
        </div>

        <div className="field-span2">
          <label className="field-label" htmlFor="editar-plano">
            Plano
          </label>
          <select
            id="editar-plano"
            className="input-field"
            value={form.planoId}
            onChange={(e) => handleChange("planoId", e.target.value)}
          >
            <option value="">
              {loadingPlanos ? "Carregando planos..." : "Selecione um plano"}
            </option>
            {!loadingPlanos &&
              planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.preco ? `${plano.nome} — ${plano.preco}` : plano.nome}
                </option>
              ))}
          </select>
          {errors.planoId ? <p className="field-error">{errors.planoId}</p> : null}
        </div>

        {feedbackSucesso ? (
          <p className="field-span2 auth-alert auth-alert--success">{feedbackSucesso}</p>
        ) : null}
        {feedbackErro ? (
          <p className="field-span2 auth-alert auth-alert--error">{feedbackErro}</p>
        ) : null}

        <div className="field-span2 form-actions">
          <button type="button" className="btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loadingSubmit}>
            {loadingSubmit ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </section>
  );
}
