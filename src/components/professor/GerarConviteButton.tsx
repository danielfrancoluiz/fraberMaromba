"use client";

import { Link } from "lucide-react";
import { useConvite } from "@/hooks/useConvite";

interface GerarConviteButtonProps {
  professorId: string;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  success: "#22c55e",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

export function GerarConviteButton({ professorId }: GerarConviteButtonProps) {
  const { gerarLink, copiarLink, linkGerado, copiado, loading, erro } =
    useConvite(professorId);

  return (
    <section
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        fontFamily: "Inter, sans-serif",
        display: "grid",
        gap: "12px",
      }}
    >
      <button
        type="button"
        onClick={() => void gerarLink()}
        disabled={loading}
        style={{
          minHeight: "48px",
          border: "none",
          borderRadius: "10px",
          backgroundColor: colors.primary,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.75 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Link size={18} />
        {loading ? "Gerando..." : "Gerar Link de Convite"}
      </button>

      {linkGerado ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            readOnly
            value={linkGerado}
            style={{
              flex: 1,
              minWidth: "200px",
              minHeight: "48px",
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              padding: "10px 12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.9rem",
            }}
          />
          <button
            type="button"
            onClick={() => void copiarLink()}
            style={{
              minHeight: "48px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: copiado ? colors.success : colors.primary,
              color: colors.textPrimary,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              padding: "0 16px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {copiado ? "Copiado! ✓" : "Copiar"}
          </button>
        </div>
      ) : null}

      {erro ? (
        <p style={{ margin: 0, color: colors.secondary, fontSize: "0.9rem" }}>
          {erro}
        </p>
      ) : null}
    </section>
  );
}
