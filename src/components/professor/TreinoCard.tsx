"use client";

import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import { Treino } from "@/types";
import { labelObjetivoTreino } from "@/lib/treino-objetivos";

interface TreinoCardProps {
  treino: Treino;
  onEditar?: (treino: Treino) => void;
  onExcluir?: (treino: Treino) => void;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

const diaLabel: Record<Treino["diaSemana"], string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function TreinoCard({ treino, onEditar, onExcluir }: TreinoCardProps) {
  const objetivoLabel = labelObjetivoTreino(treino.objetivo);

  return (
    <article
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Dumbbell size={18} color={colors.primary} />
          <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: "1rem" }}>
            {treino.nome}
          </h3>
        </div>
        <span
          style={{
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            borderRadius: "999px",
            padding: "5px 10px",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          {diaLabel[treino.diaSemana]}
        </span>
      </header>

      {objetivoLabel ? (
        <p style={{ margin: "0 0 8px", color: colors.textSecondary, fontSize: "0.85rem" }}>
          Meta: {objetivoLabel}
        </p>
      ) : null}

      {treino.descricao ? (
        <p style={{ margin: "0 0 10px", color: colors.textSecondary, fontSize: "0.85rem" }}>
          {treino.descricao}
        </p>
      ) : null}

      {(onEditar || onExcluir) && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {onEditar ? (
            <button
              type="button"
              className="chip chip--icon"
              onClick={() => onEditar(treino)}
              aria-label="Editar treino"
            >
              <Pencil size={16} />
            </button>
          ) : null}
          {onExcluir ? (
            <button
              type="button"
              className="chip chip--danger chip--icon"
              onClick={() => onExcluir(treino)}
              aria-label="Excluir treino"
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      )}

      <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "8px" }}>
        {treino.exercicios.map((exercicio) => (
          <li key={exercicio.id} style={{ color: colors.textPrimary }}>
            <strong style={{ fontSize: "0.95rem" }}>{exercicio.nome}</strong>
            <span style={{ marginLeft: "6px", color: colors.textSecondary, fontSize: "0.9rem" }}>
              {exercicio.series} x {exercicio.repeticoes}
            </span>
            {exercicio.observacao ? (
              <p style={{ margin: "4px 0 0", color: colors.textSecondary, fontSize: "0.85rem" }}>
                {exercicio.observacao}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </article>
  );
}
