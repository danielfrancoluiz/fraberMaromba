"use client";

import { CreditCard, Check } from "lucide-react";
import { usePlanos } from "@/hooks/usePlanos";
import { usePagamento } from "@/hooks/usePagamento";
import type { PlanoOpcao } from "@/lib/planos-pagamento";

interface PlanoCardProps {
  plano: PlanoOpcao;
  alunoId?: string;
  planoAtualId?: string | null;
}

function PlanoCard({ plano, alunoId, planoAtualId }: PlanoCardProps) {
  const { loading, erro, iniciarPagamento } = usePagamento({
    planoId: plano.id,
    alunoId,
  });

  const atual = planoAtualId === plano.id;
  const dias = plano.diasValidade ?? 0;

  return (
    <article className={`card planos-card${atual ? " planos-card--atual" : ""}`}>
      <div className="planos-card-head">
        <h2 className="planos-card-nome">{plano.nome}</h2>
        {atual ? (
          <span className="planos-card-badge">Plano atual</span>
        ) : null}
      </div>

      <p className="planos-card-preco">{plano.preco}</p>

      <ul className="planos-card-lista">
        <li>
          <Check size={16} aria-hidden />
          Válido por {dias} {dias === 1 ? "dia" : "dias"} após o pagamento
        </li>
        <li>
          <Check size={16} aria-hidden />
          Acesso à plataforma Fraber
        </li>
        <li>
          <Check size={16} aria-hidden />
          Pagamento seguro via Stripe
        </li>
      </ul>

      {erro ? <p className="field-error">{erro}</p> : null}

      <button
        type="button"
        className="btn-primary"
        disabled={loading}
        onClick={() => void iniciarPagamento()}
      >
        {loading ? "Redirecionando..." : atual ? "Renovar plano" : "Contratar"}
      </button>
    </article>
  );
}

interface PlanosContratarProps {
  /** Se informado, pagamento do aluno; senão, professor paga a si. */
  alunoId?: string;
  planoAtualId?: string | null;
  titulo?: string;
  subtitulo?: string;
}

export function PlanosContratar({
  alunoId,
  planoAtualId,
  titulo = "Escolha seu plano",
  subtitulo = "Selecione um plano para continuar. O valor é cobrado no Stripe.",
}: PlanosContratarProps) {
  const { planos, loading, erro } = usePlanos({ checkout: true });

  return (
    <div className="page-stack">
      <div>
        <h1 className="page-header-title" style={{ marginBottom: 8 }}>
          <CreditCard size={28} style={{ display: "inline", marginRight: 10, verticalAlign: -4 }} />
          {titulo}
        </h1>
        <p className="text-muted" style={{ margin: 0 }}>
          {subtitulo}
        </p>
      </div>

      {loading ? <p className="text-muted">Carregando planos...</p> : null}
      {erro ? <p className="field-error">{erro}</p> : null}

      <div className="planos-grid">
        {planos.map((plano) => (
          <PlanoCard
            key={plano.id}
            plano={plano}
            alunoId={alunoId}
            planoAtualId={planoAtualId}
          />
        ))}
      </div>

      {!loading && planos.length === 0 ? (
        <p className="text-muted">Nenhum plano disponível para contratação no momento.</p>
      ) : null}
    </div>
  );
}
