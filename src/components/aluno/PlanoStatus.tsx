"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { usePagamento } from "@/hooks/usePagamento";

interface PlanoStatusProps {
  alunoId: string;
  planoId: string;
  status: string;
}

interface PlanoOption {
  id: string;
  nome: string;
  preco: string;
}

const PLANOS: PlanoOption[] = [
  { id: "mensal", nome: "Mensal", preco: "R$99,90" },
  { id: "semestral", nome: "Semestral", preco: "R$499,90" },
  { id: "anual", nome: "Anual", preco: "R$899,90" },
  { id: "avulso", nome: "Avulso", preco: "R$29,90" },
];

const PLANOS_NOME: Record<string, string> = {
  mensal: "Mensal",
  semestral: "Semestral",
  anual: "Anual",
  avulso: "Avulso",
  gympass: "Gympass",
};

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
  success: "#22c55e",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "ativo_professor") {
    return (
      <span
        style={{
          display: "inline-block",
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          color: colors.success,
          borderRadius: "999px",
          padding: "4px 12px",
          fontSize: "0.85rem",
          fontWeight: 600,
        }}
      >
        Ativo via Professor
      </span>
    );
  }

  if (status === "ativo_plataforma") {
    return (
      <span
        style={{
          display: "inline-block",
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          color: colors.success,
          borderRadius: "999px",
          padding: "4px 12px",
          fontSize: "0.85rem",
          fontWeight: 600,
        }}
      >
        Ativo
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: "rgba(232, 0, 28, 0.15)",
        color: colors.secondary,
        borderRadius: "999px",
        padding: "4px 12px",
        fontSize: "0.85rem",
        fontWeight: 600,
      }}
    >
      Inativo
    </span>
  );
}

export function PlanoStatus({ alunoId, planoId, status }: PlanoStatusProps) {
  const [planoSelecionado, setPlanoSelecionado] = useState(planoId);
  const { loading, erro, iniciarPagamento } = usePagamento({
    alunoId,
    planoId: planoSelecionado,
  });

  const nomePlanoAtual = PLANOS_NOME[planoId] ?? planoId;

  return (
    <article
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "1.25rem",
        marginBottom: "1.25rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          margin: "0 0 0.75rem",
          color: colors.textPrimary,
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <CreditCard size={22} color={colors.primary} />
        Meu Plano
      </h2>

      <p
        style={{
          margin: "0 0 0.5rem",
          color: colors.primary,
          fontSize: "1.5rem",
          fontWeight: 700,
        }}
      >
        {nomePlanoAtual}
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <StatusBadge status={status} />
      </div>

      <label
        style={{
          display: "block",
          color: colors.textSecondary,
          fontSize: "0.9rem",
          marginBottom: "6px",
        }}
      >
        Escolher plano
      </label>
      <select
        value={planoSelecionado}
        onChange={(e) => setPlanoSelecionado(e.target.value)}
        disabled={loading}
        style={{
          width: "100%",
          minHeight: "48px",
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          backgroundColor: "#0D1B2E",
          color: colors.textPrimary,
          padding: "10px 12px",
          marginBottom: "1rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {PLANOS.map((plano) => (
          <option key={plano.id} value={plano.id}>
            {plano.nome} {plano.preco}
          </option>
        ))}
      </select>

      {erro ? (
        <p style={{ margin: "0 0 1rem", color: colors.secondary, fontSize: "0.9rem" }}>
          {erro}
        </p>
      ) : null}

      <button
        type="button"
        disabled={loading}
        onClick={() => void iniciarPagamento()}
        style={{
          width: "100%",
          minHeight: "48px",
          border: "none",
          borderRadius: "10px",
          backgroundColor: colors.primary,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.75 : 1,
        }}
      >
        {loading ? "Redirecionando para pagamento..." : "Assinar / Renovar Plano"}
      </button>
    </article>
  );
}
