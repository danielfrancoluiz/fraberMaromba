"use client";

import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import { TreinoTemplate } from "@/types";

interface TemplateCardProps {
  template: TreinoTemplate;
  onAtribuir: (t: TreinoTemplate) => void;
  onEditar: (t: TreinoTemplate) => void;
  onSolicitarExclusao: (t: TreinoTemplate) => void;
}

function formatarData(dataIso: string): string {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "--/--/----";
  return data.toLocaleDateString("pt-BR");
}

export function TemplateCard({
  template,
  onAtribuir,
  onEditar,
  onSolicitarExclusao,
}: TemplateCardProps) {
  return (
    <article className="card template-card">
      <header className="template-card-header">
        <h3 className="template-card-title">
          <Dumbbell size={17} color="var(--fraber-primary)" />
          <span>{template.nome}</span>
        </h3>
        <span className="text-muted template-card-date">
          {formatarData(template.dataCriacao)}
        </span>
      </header>

      {template.descricao ? (
        <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          {template.descricao}
        </p>
      ) : null}

      <p style={{ margin: 0, fontSize: "0.9rem" }}>
        {template.exercicios.length} exercício(s)
      </p>

      <ul className="template-card-exercicios">
        {template.exercicios.map((exercicio) => (
          <li key={exercicio.id}>{exercicio.nome}</li>
        ))}
      </ul>

      <div className="template-card-actions">
        <button
          type="button"
          className="btn-primary template-card-btn-atribuir"
          onClick={() => onAtribuir(template)}
        >
          Atribuir a Aluno
        </button>
        <div className="template-card-actions-row">
          <button
            type="button"
            className="chip template-card-chip"
            onClick={() => onEditar(template)}
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            className="chip template-card-chip template-card-chip--danger"
            onClick={() => onSolicitarExclusao(template)}
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}
