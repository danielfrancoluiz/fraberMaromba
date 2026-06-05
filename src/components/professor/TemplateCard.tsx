"use client";

import { ClipboardList, Dumbbell, Pencil, Trash2 } from "lucide-react";
import { TreinoTemplate } from "@/types";
import { Badge } from "@/components/ui/Badge";

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
          <Dumbbell size={17} className="text-accent" />
          <span>{template.nome}</span>
        </h3>
        <Badge variant="muted">{formatarData(template.dataCriacao)}</Badge>
      </header>

      {template.descricao ? (
        <p className="text-muted template-card-desc">{template.descricao}</p>
      ) : null}

      <p className="template-card-count">
        {template.exercicios.length} exercício
        {template.exercicios.length !== 1 ? "s" : ""}
      </p>

      <ul className="template-card-exercicios">
        {template.exercicios.slice(0, 4).map((exercicio) => (
          <li key={exercicio.id}>{exercicio.nome}</li>
        ))}
        {template.exercicios.length > 4 ? (
          <li className="text-muted">+{template.exercicios.length - 4} mais</li>
        ) : null}
      </ul>

      <div className="template-card-actions">
        <button
          type="button"
          className="btn-primary template-card-btn-atribuir"
          onClick={() => onAtribuir(template)}
        >
          <ClipboardList size={16} />
          Atribuir a aluno
        </button>
        <div className="template-card-actions-row">
          <button
            type="button"
            className="chip chip--icon"
            onClick={() => onEditar(template)}
            aria-label="Editar template"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="chip chip--danger chip--icon"
            onClick={() => onSolicitarExclusao(template)}
            aria-label="Excluir template"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
