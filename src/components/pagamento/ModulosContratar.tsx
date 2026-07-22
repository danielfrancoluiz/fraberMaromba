"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { PagamentoElements } from "@/components/pagamento/PagamentoElements";
import { usePagamento } from "@/hooks/usePagamento";
import {
  MODULOS_ALUNO,
  PRECOS_MODULOS_PADRAO,
  labelsModulos,
  type ModuloAlunoId,
} from "@/lib/modulos-aluno";

function formatarPreco(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

interface ModulosContratarProps {
  alunoId: string;
  modulosAtuais?: string[];
}

export function ModulosContratar({
  alunoId,
  modulosAtuais = [],
}: ModulosContratarProps) {
  const [selecionados, setSelecionados] = useState<ModuloAlunoId[]>(
    modulosAtuais.filter((m): m is ModuloAlunoId =>
      MODULOS_ALUNO.some((x) => x.id === m)
    )
  );
  const [precos, setPrecos] = useState<Record<number, number>>({
    ...PRECOS_MODULOS_PADRAO,
  });

  const {
    loading,
    erro,
    clientSecret,
    iniciarPagamento,
    cancelarPagamento,
  } = usePagamento({
    alunoId,
    modulos: selecionados,
  });

  useEffect(() => {
    let ativo = true;
    void fetch("/api/precos-modulos")
      .then((r) => r.json())
      .then((body: unknown) => {
        if (!ativo || !Array.isArray(body)) return;
        const map: Record<number, number> = { ...PRECOS_MODULOS_PADRAO };
        for (const item of body) {
          if (
            typeof item === "object" &&
            item !== null &&
            "quantidade" in item &&
            "valorCentavos" in item &&
            typeof (item as { quantidade: number }).quantidade === "number" &&
            typeof (item as { valorCentavos: number }).valorCentavos === "number"
          ) {
            map[(item as { quantidade: number }).quantidade] = (
              item as { valorCentavos: number }
            ).valorCentavos;
          }
        }
        setPrecos(map);
      })
      .catch(() => {
        /* mantém padrão */
      });
    return () => {
      ativo = false;
    };
  }, []);

  const qtd = selecionados.length as 0 | 1 | 2 | 3;
  const valorCentavos = qtd === 0 ? 0 : precos[qtd] ?? PRECOS_MODULOS_PADRAO[qtd];

  const tabelaPrecos = useMemo(
    () => [
      { qtd: 1, label: "1 módulo", preco: formatarPreco(precos[1] ?? 1990) },
      { qtd: 2, label: "2 módulos", preco: formatarPreco(precos[2] ?? 2990) },
      { qtd: 3, label: "3 módulos", preco: formatarPreco(precos[3] ?? 3990) },
    ],
    [precos]
  );

  function toggle(id: ModuloAlunoId) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    cancelarPagamento();
  }

  return (
    <div className="page-stack">
      <div>
        <h1 className="page-header-title" style={{ marginBottom: 8 }}>
          <CreditCard
            size={28}
            style={{ display: "inline", marginRight: 10, verticalAlign: -4 }}
          />
          Escolha seus módulos
        </h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Plano mensal. Selecione Musculação, Corrida e/ou Nutrição. O valor
          depende da quantidade escolhida.
        </p>
      </div>

      <div className="modulos-precos-tabela">
        {tabelaPrecos.map((p) => (
          <div key={p.qtd} className="modulos-preco-item">
            <strong>{p.label}</strong>
            <span>{p.preco}/mês</span>
          </div>
        ))}
      </div>

      <div className="modulos-grid">
        {MODULOS_ALUNO.map((modulo) => {
          const ativo = selecionados.includes(modulo.id);
          const jaTem = modulosAtuais.includes(modulo.id);
          return (
            <button
              key={modulo.id}
              type="button"
              className={`card modulos-card${ativo ? " modulos-card--ativo" : ""}`}
              onClick={() => toggle(modulo.id)}
              aria-pressed={ativo}
            >
              <div className="modulos-card-head">
                <h2 className="modulos-card-nome">{modulo.label}</h2>
                {ativo ? <Check size={18} aria-hidden /> : null}
              </div>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                {modulo.descricao}
              </p>
              {jaTem ? (
                <span className="modulos-card-badge">Ativo no plano atual</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <article className="card">
        <p style={{ margin: "0 0 8px" }}>
          <strong>Selecionado:</strong>{" "}
          {qtd === 0 ? "Nenhum módulo" : labelsModulos(selecionados)}
        </p>
        <p className="modulos-total" style={{ margin: "0 0 16px" }}>
          {qtd === 0 ? "—" : formatarPreco(valorCentavos)}
          {qtd > 0 ? <span className="text-muted"> / mês</span> : null}
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
            disabled={loading || qtd === 0}
            onClick={() => void iniciarPagamento()}
          >
            {loading ? "Preparando..." : "Pagar com cartão"}
          </button>
        )}
      </article>
    </div>
  );
}
