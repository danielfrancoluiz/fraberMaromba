"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { PagamentoElements } from "@/components/pagamento/PagamentoElements";
import { usePagamento } from "@/hooks/usePagamento";

type Oferta = {
  id: string;
  grupo: string;
  nome: string;
  descricao: string | null;
  valorCentavos: number;
  diasValidade: number;
  modulos: string[];
  badge: string | null;
};

function formatarPreco(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

interface OfertasContratarProps {
  alunoId: string;
  grupo: "treino" | "nutricao";
  titulo?: string;
  subtitulo?: string;
  modulosAtuais?: string[];
}

export function OfertasContratar({
  alunoId,
  grupo,
  titulo,
  subtitulo,
  modulosAtuais = [],
}: OfertasContratarProps) {
  const ativos = useMemo(() => new Set(modulosAtuais), [modulosAtuais]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [loadingLista, setLoadingLista] = useState(true);

  const {
    loading,
    erro,
    clientSecret,
    iniciarPagamento,
    cancelarPagamento,
  } = usePagamento({
    alunoId,
    ofertaId: escolhida ?? undefined,
  });

  useEffect(() => {
    let ativo = true;
    void fetch(`/api/ofertas?grupo=${encodeURIComponent(grupo)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((body: unknown) => {
        if (!ativo) return;
        setOfertas(Array.isArray(body) ? (body as Oferta[]) : []);
      })
      .catch(() => {
        if (ativo) setOfertas([]);
      })
      .finally(() => {
        if (ativo) setLoadingLista(false);
      });
    return () => {
      ativo = false;
    };
  }, [grupo]);

  const ofertasVisiveis = useMemo(() => {
    if (grupo !== "treino") return ofertas;
    const temMusc = ativos.has("musculacao");
    const temCorrida = ativos.has("corrida");
    return ofertas.filter((o) => {
      if (o.id === "treino_combo_musc_corrida") {
        return !temMusc && !temCorrida;
      }
      if (o.id === "treino_musculacao") return !temMusc;
      if (o.id === "treino_corrida") return !temCorrida;
      return true;
    });
  }, [ofertas, grupo, ativos]);

  const ofertaSel = ofertasVisiveis.find((o) => o.id === escolhida) ?? null;
  const badgeGeral =
    ofertasVisiveis.find((o) => o.badge)?.badge ??
    (grupo === "treino" ? "Mês promocional / inauguração" : null);

  return (
    <div className="page-stack ofertas-contratar">
      <div>
        <h1 className="page-header-title" style={{ marginBottom: 8 }}>
          <CreditCard
            size={28}
            style={{ display: "inline", marginRight: 10, verticalAlign: -4 }}
          />
          {titulo ?? (grupo === "treino" ? "Contratar treino" : "Nutrição")}
        </h1>
        {badgeGeral ? <p className="ofertas-badge">{badgeGeral}</p> : null}
        <p className="text-muted" style={{ margin: "8px 0 0" }}>
          {subtitulo ??
            (grupo === "treino"
              ? "Escolha Musculação, Corrida ou o combo com desconto."
              : "Escolha o plano nutricional. Após a compra, preencha a anamnese.")}
        </p>
      </div>

      {loadingLista ? (
        <p className="text-muted">Carregando ofertas...</p>
      ) : ofertasVisiveis.length === 0 ? (
        <p className="text-muted">
          {grupo === "treino"
            ? "Você já tem os módulos de treino ativos neste período."
            : "Nenhuma oferta disponível no momento."}
        </p>
      ) : (
        <div className="ofertas-lista" role="radiogroup" aria-label="Ofertas">
          {ofertasVisiveis.map((o) => {
            const selected = escolhida === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`oferta-card${selected ? " oferta-card--ativo" : ""}`}
                onClick={() => {
                  setEscolhida(o.id);
                  cancelarPagamento();
                }}
              >
                <span className="oferta-card-top">
                  <span className="oferta-card-nome">{o.nome}</span>
                  {selected ? <Check size={18} aria-hidden /> : null}
                </span>
                {o.descricao ? (
                  <span className="oferta-card-desc text-muted">{o.descricao}</span>
                ) : null}
                <span className="oferta-card-preco">
                  {formatarPreco(o.valorCentavos)}
                  <span className="text-muted">
                    {o.diasValidade === 7 ? " / 7 dias" : " / mês"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {ofertaSel ? (
        <article className="card">
          <p style={{ margin: "0 0 8px" }}>
            <strong>Selecionado:</strong> {ofertaSel.nome}
          </p>
          <p className="modulos-total" style={{ margin: "0 0 16px" }}>
            {formatarPreco(ofertaSel.valorCentavos)}
          </p>

          {erro ? <p className="field-error">{erro}</p> : null}

          {clientSecret ? (
            <PagamentoElements
              clientSecret={clientSecret}
              onCancelar={cancelarPagamento}
            />
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={loading || !escolhida}
              onClick={() => void iniciarPagamento()}
            >
              {loading ? "Preparando..." : "Pagar com cartão"}
            </button>
          )}
        </article>
      ) : null}
    </div>
  );
}
