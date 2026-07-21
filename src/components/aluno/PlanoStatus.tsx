"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { usePagamento } from "@/hooks/usePagamento";
import { labelPlano } from "@/lib/planos-pagamento";
import { usePlanos } from "@/hooks/usePlanos";

interface PlanoStatusProps {
  alunoId: string;
  planoId: string;
  status: string;
  /** Exibir seletor e botão de pagamento (ex.: conta inativa) */
  mostrarPagamento?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const ativo =
    status === "ativo_professor" || status === "ativo_plataforma";

  return (
    <span
      className={`plano-status-badge${ativo ? " plano-status-badge--ativo" : " plano-status-badge--inativo"}`}
    >
      {status === "ativo_professor"
        ? "Ativo via professor"
        : ativo
          ? "Ativo"
          : "Inativo"}
    </span>
  );
}

export function PlanoStatus({
  alunoId,
  planoId,
  status,
  mostrarPagamento = false,
}: PlanoStatusProps) {
  const { planos, loading: loadingPlanos } = usePlanos({ checkout: true });
  const [planoSelecionado, setPlanoSelecionado] = useState(planoId);
  const { loading, erro, iniciarPagamento } = usePagamento({
    alunoId,
    planoId: planoSelecionado,
  });

  useEffect(() => {
    if (planos.length === 0) return;
    const existe = planos.some((p) => p.id === planoSelecionado);
    if (!existe) setPlanoSelecionado(planos[0].id);
  }, [planos, planoSelecionado]);

  const inativo = status === "inativo";
  const exibirCheckout = mostrarPagamento || inativo;
  const nomePlano =
    planos.find((p) => p.id === planoId)?.nome ?? labelPlano(planoId);

  return (
    <article className="card plano-status-card">
      <h2 className="plano-status-titulo">
        <CreditCard size={22} />
        Meu plano
      </h2>

      <p className="plano-status-plano-nome">{nomePlano}</p>

      <div className="plano-status-badge-wrap">
        <StatusBadge status={status} />
      </div>

      {exibirCheckout ? (
        <>
          {inativo ? (
            <p className="plano-status-aviso">
              Sua conta está inativa. Assine ou renove um plano para acessar os
              treinos.
            </p>
          ) : null}

          <label className="label-campo" htmlFor="plano-select">
            Escolher plano
          </label>
          <select
            id="plano-select"
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

          {erro ? <p className="erro-campo">{erro}</p> : null}

          <button
            type="button"
            className="btn-primary plano-status-cta"
            disabled={loading || loadingPlanos || !alunoId || planos.length === 0}
            onClick={() => void iniciarPagamento()}
          >
            {loading ? "Redirecionando..." : "Pagar / renovar plano"}
          </button>
        </>
      ) : null}
    </article>
  );
}
