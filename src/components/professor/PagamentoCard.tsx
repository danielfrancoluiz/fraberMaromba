"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { usePagamento } from "@/hooks/usePagamento";
import { HistoricoPagamentos } from "@/components/pagamento/HistoricoPagamentos";
import { PLANOS_CHECKOUT, PLANOS_LABEL } from "@/lib/planos-pagamento";

interface PagamentoCardProps {
  alunoId: string;
  planoAtual: string;
}

export function PagamentoCard({ alunoId, planoAtual }: PagamentoCardProps) {
  const [planoSelecionado, setPlanoSelecionado] = useState(planoAtual);
  const { loading, erro, iniciarPagamento } = usePagamento({
    alunoId,
    planoId: planoSelecionado,
  });

  return (
    <div className="pagamento-section">
      <article className="card pagamento-card">
        <h2 className="pagamento-card-titulo">
          <CreditCard size={22} />
          Plano atual
        </h2>

        <p className="pagamento-card-plano">
          {PLANOS_LABEL[planoAtual] ?? planoAtual}
        </p>

        <label className="label-campo" htmlFor="plano-prof-select">
          Escolher plano
        </label>
        <select
          id="plano-prof-select"
          className="input-field"
          value={planoSelecionado}
          onChange={(e) => setPlanoSelecionado(e.target.value)}
          disabled={loading}
        >
          {PLANOS_CHECKOUT.map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome} — {plano.preco}
            </option>
          ))}
        </select>

        {erro ? <p className="erro-campo">{erro}</p> : null}

        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={() => void iniciarPagamento()}
        >
          {loading ? "Redirecionando..." : "Renovar / alterar plano"}
        </button>
      </article>

      <HistoricoPagamentos alunoId={alunoId} />
    </div>
  );
}
