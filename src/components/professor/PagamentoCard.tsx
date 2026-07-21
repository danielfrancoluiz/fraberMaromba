"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { usePagamento } from "@/hooks/usePagamento";
import { HistoricoPagamentos } from "@/components/pagamento/HistoricoPagamentos";
import { labelPlano } from "@/lib/planos-pagamento";
import { usePlanos } from "@/hooks/usePlanos";

interface PagamentoCardProps {
  alunoId: string;
  planoAtual: string;
}

export function PagamentoCard({ alunoId, planoAtual }: PagamentoCardProps) {
  const { planos, loading: loadingPlanos, erro: erroPlanos } = usePlanos({
    checkout: true,
  });
  const [planoSelecionado, setPlanoSelecionado] = useState(planoAtual);
  const { loading, erro, iniciarPagamento } = usePagamento({
    alunoId,
    planoId: planoSelecionado,
  });

  useEffect(() => {
    if (planos.length === 0) return;
    const existe = planos.some((p) => p.id === planoSelecionado);
    if (!existe) setPlanoSelecionado(planos[0].id);
  }, [planos, planoSelecionado]);

  const nomePlanoAtual =
    planos.find((p) => p.id === planoAtual)?.nome ?? labelPlano(planoAtual);

  return (
    <div className="pagamento-section">
      <article className="card pagamento-card">
        <h2 className="pagamento-card-titulo">
          <CreditCard size={22} />
          Plano atual
        </h2>

        <p className="pagamento-card-plano">{nomePlanoAtual}</p>

        <label className="label-campo" htmlFor="plano-prof-select">
          Escolher plano
        </label>
        <select
          id="plano-prof-select"
          className="input-field"
          value={planoSelecionado}
          onChange={(e) => setPlanoSelecionado(e.target.value)}
          disabled={loading || loadingPlanos || planos.length === 0}
        >
          {planos.map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome} — {plano.preco}
            </option>
          ))}
        </select>

        {erroPlanos ? <p className="erro-campo">{erroPlanos}</p> : null}
        {erro ? <p className="erro-campo">{erro}</p> : null}

        <button
          type="button"
          className="btn-primary"
          disabled={loading || loadingPlanos || planos.length === 0}
          onClick={() => void iniciarPagamento()}
        >
          {loading ? "Redirecionando..." : "Renovar / alterar plano"}
        </button>
      </article>

      <HistoricoPagamentos alunoId={alunoId} />
    </div>
  );
}
