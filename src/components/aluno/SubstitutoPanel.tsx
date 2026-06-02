"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { ExercicioSubstituto } from "@/types";

interface SubstitutoPanelProps {
  substitutos: ExercicioSubstituto[];
  loading: boolean;
  onSelecionar: (s: ExercicioSubstituto) => void;
  onCancelar: () => void;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

export function SubstitutoPanel({
  substitutos,
  loading,
  onSelecionar,
  onCancelar,
}: SubstitutoPanelProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <section
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.primary}`,
        borderRadius: "12px",
        padding: "14px 16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px",
          color: colors.textPrimary,
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <RefreshCw size={18} color={colors.primary} />
        Escolha um substituto
      </h3>

      {loading ? (
        <p style={{ margin: 0, color: colors.textSecondary }}>Carregando substitutos...</p>
      ) : substitutos.length === 0 ? (
        <p style={{ margin: 0, color: colors.textSecondary }}>
          Nenhum substituto disponível para este grupo muscular.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {substitutos.map((substituto) => (
            <button
              key={substituto.id}
              type="button"
              onClick={() => onSelecionar(substituto)}
              onMouseEnter={() => setHoverId(substituto.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                textAlign: "left",
                border: `1px solid ${hoverId === substituto.id ? colors.primary : colors.border}`,
                borderRadius: "10px",
                backgroundColor: colors.surface,
                padding: "12px",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <strong style={{ color: colors.textPrimary, fontSize: "0.95rem" }}>
                {substituto.nome}
              </strong>
              {substituto.descricao ? (
                <p style={{ margin: "4px 0 0", color: colors.textSecondary, fontSize: "0.85rem" }}>
                  {substituto.descricao}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onCancelar}
        style={{
          marginTop: "14px",
          border: "none",
          background: "transparent",
          color: colors.textSecondary,
          fontFamily: "Inter, sans-serif",
          fontSize: "0.9rem",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Cancelar
      </button>
    </section>
  );
}
