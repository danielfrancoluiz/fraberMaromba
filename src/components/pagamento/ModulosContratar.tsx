"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Info, Lock } from "lucide-react";
import { PagamentoElements } from "@/components/pagamento/PagamentoElements";
import { usePagamento } from "@/hooks/usePagamento";
import {
  MODULOS_ALUNO,
  PRECOS_MODULOS_PADRAO,
  labelsModulos,
  precoPorModuloCentavos,
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
  /** Módulos ainda vigentes no período mensal — ficam travados. */
  modulosAtuais?: string[];
  modulosVencimentos?: Partial<Record<string, string>>;
}

export function ModulosContratar({
  alunoId,
  modulosAtuais = [],
  modulosVencimentos = {},
}: ModulosContratarProps) {
  const travados = useMemo(
    () =>
      new Set(
        modulosAtuais.filter((m): m is ModuloAlunoId =>
          MODULOS_ALUNO.some((x) => x.id === m)
        )
      ),
    [modulosAtuais]
  );

  const [novos, setNovos] = useState<ModuloAlunoId[]>([]);
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
    modulos: novos,
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

  const qtdNovos = novos.length as 0 | 1 | 2 | 3;
  const valorCentavos =
    qtdNovos === 0 ? 0 : precos[qtdNovos] ?? PRECOS_MODULOS_PADRAO[qtdNovos];

  const pacotes = useMemo(() => {
    const p1 = precos[1] ?? 1990;
    const p2 = precos[2] ?? 2990;
    const p3 = precos[3] ?? 3990;
    return [
      {
        qtd: 1 as const,
        titulo: "1 módulo",
        total: formatarPreco(p1),
        porModulo: formatarPreco(precoPorModuloCentavos(1, p1)),
        destaque: "Preço cheio",
      },
      {
        qtd: 2 as const,
        titulo: "2 módulos juntos",
        total: formatarPreco(p2),
        porModulo: formatarPreco(precoPorModuloCentavos(2, p2)),
        destaque: "Mais barato por módulo",
      },
      {
        qtd: 3 as const,
        titulo: "3 módulos juntos",
        total: formatarPreco(p3),
        porModulo: formatarPreco(precoPorModuloCentavos(3, p3)),
        destaque: "Melhor custo",
      },
    ];
  }, [precos]);

  function toggle(id: ModuloAlunoId) {
    if (travados.has(id)) return;
    setNovos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    cancelarPagamento();
  }

  function formatarVence(id: ModuloAlunoId): string | null {
    const raw = modulosVencimentos[id];
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("pt-BR");
  }

  return (
    <div className="page-stack modulos-contratar">
      <div>
        <h1 className="page-header-title" style={{ marginBottom: 8 }}>
          <CreditCard
            size={28}
            style={{ display: "inline", marginRight: 10, verticalAlign: -4 }}
          />
          Escolha seus módulos
        </h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Quanto mais módulos você contratar <strong>na mesma compra</strong>,
          mais barato fica cada um.
        </p>
      </div>

      <div className="modulos-pacotes">
        {pacotes.map((p) => (
          <article
            key={p.qtd}
            className={`modulos-pacote${qtdNovos === p.qtd ? " modulos-pacote--destaque" : ""}`}
          >
            <p className="modulos-pacote-titulo">{p.titulo}</p>
            <p className="modulos-pacote-total">{p.total}</p>
            <p className="modulos-pacote-unit">{p.porModulo} por módulo</p>
            <p className="modulos-pacote-tag">{p.destaque}</p>
          </article>
        ))}
      </div>

      <aside className="card modulos-aviso">
        <Info size={18} aria-hidden />
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>Como funciona o desconto</p>
          <p className="text-muted" style={{ margin: "6px 0 0", fontSize: "0.88rem" }}>
            O desconto vale só se você comprar 2 ou 3 módulos <strong>juntos nesta
            compra</strong>. Se você já tem um módulo ativo e contratar outro
            depois, em outra data, o novo sai no preço de 1 módulo (
            {formatarPreco(precos[1] ?? 1990)}), porque cada compra tem o
            próprio período mensal.
          </p>
        </div>
      </aside>

      <div className="modulos-grid" role="group" aria-label="Módulos disponíveis">
        {MODULOS_ALUNO.map((modulo) => {
          const travado = travados.has(modulo.id);
          const escolhido = novos.includes(modulo.id);
          const venceEm = formatarVence(modulo.id);

          return (
            <button
              key={modulo.id}
              type="button"
              className={`card modulos-card${escolhido ? " modulos-card--ativo" : ""}${travado ? " modulos-card--travado" : ""}`}
              onClick={() => toggle(modulo.id)}
              aria-pressed={escolhido || travado}
              aria-disabled={travado}
              disabled={travado}
            >
              <span className="modulos-card-head">
                <span className="modulos-card-nome">{modulo.label}</span>
                {travado ? (
                  <Lock size={16} aria-hidden />
                ) : escolhido ? (
                  <Check size={18} aria-hidden />
                ) : null}
              </span>
              <span className="modulos-card-desc text-muted">
                {modulo.descricao}
              </span>
              {travado ? (
                <span className="modulos-card-badge">
                  Ativo até {venceEm ?? "o fim do período"} — não pode desmarcar
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <article className="card">
        {travados.size > 0 ? (
          <p className="text-muted" style={{ margin: "0 0 10px", fontSize: "0.88rem" }}>
            Já ativo: <strong>{labelsModulos([...travados])}</strong>
          </p>
        ) : null}
        <p style={{ margin: "0 0 8px" }}>
          <strong>Nesta compra:</strong>{" "}
          {qtdNovos === 0 ? "Nenhum módulo novo" : labelsModulos(novos)}
        </p>
        <p className="modulos-total" style={{ margin: "0 0 4px" }}>
          {qtdNovos === 0 ? "—" : formatarPreco(valorCentavos)}
          {qtdNovos > 0 ? <span className="text-muted"> / mês</span> : null}
        </p>
        {qtdNovos === 2 || qtdNovos === 3 ? (
          <p className="text-muted" style={{ margin: "0 0 16px", fontSize: "0.85rem" }}>
            {formatarPreco(precoPorModuloCentavos(qtdNovos, valorCentavos))} por
            módulo nesta compra
          </p>
        ) : (
          <div style={{ height: 16 }} />
        )}

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
            disabled={loading || qtdNovos === 0}
            onClick={() => void iniciarPagamento()}
          >
            {loading ? "Preparando..." : "Pagar com cartão"}
          </button>
        )}
      </article>
    </div>
  );
}
