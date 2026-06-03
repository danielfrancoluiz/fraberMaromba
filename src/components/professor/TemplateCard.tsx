"use client";

import { useState } from "react";
import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import { TreinoTemplate } from "@/types";

interface TemplateCardProps {
  template: TreinoTemplate;
  onAtribuir: (t: TreinoTemplate) => void;
  onEditar: (t: TreinoTemplate) => void;
  onExcluir: (t: TreinoTemplate) => void;
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
  onExcluir,
}: TemplateCardProps) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  return (
    <article className="card" style={{ display: "grid", gap: "10px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Dumbbell size={17} color="var(--fraber-primary)" />
          {template.nome}
        </h3>
        <span className="text-muted" style={{ fontSize: "0.8rem", flexShrink: 0 }}>
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

      <ul
        style={{
          margin: 0,
          paddingLeft: "18px",
          color: "var(--fraber-text-muted)",
          fontSize: "0.88rem",
          display: "grid",
          gap: "4px",
        }}
      >
        {template.exercicios.map((exercicio) => (
          <li key={exercicio.id}>{exercicio.nome}</li>
        ))}
      </ul>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
        <button type="button" className="btn-primary" style={{ flex: 1, minWidth: "140px" }} onClick={() => onAtribuir(template)}>
          Atribuir a Aluno
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => onEditar(template)}
          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <Pencil size={14} />
          Editar
        </button>
        {!confirmandoExclusao ? (
          <button
            type="button"
            className="chip"
            onClick={() => setConfirmandoExclusao(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--fraber-accent)" }}
          >
            <Trash2 size={14} />
            Excluir
          </button>
        ) : (
          <>
            <button
              type="button"
              className="chip chip-active"
              onClick={() => {
                onExcluir(template);
                setConfirmandoExclusao(false);
              }}
              style={{ color: "var(--fraber-accent)" }}
            >
              Confirmar
            </button>
            <button type="button" className="chip" onClick={() => setConfirmandoExclusao(false)}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </article>
  );
}
