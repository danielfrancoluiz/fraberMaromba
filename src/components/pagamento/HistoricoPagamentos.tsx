"use client";

import { useCallback, useEffect, useState } from "react";
import { PLANOS_LABEL } from "@/lib/planos-pagamento";

export interface PagamentoHistoricoItem {
  id: string;
  valor: number;
  status: string;
  planoId: string;
  dataVencimento: string;
  dataPagamento: string | null;
  criadoEm: string;
}

interface HistoricoPagamentosProps {
  alunoId: string;
  titulo?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
  erro_config: "Erro config.",
};

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatarValor(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function HistoricoPagamentos({
  alunoId,
  titulo = "Histórico de pagamentos",
}: HistoricoPagamentosProps) {
  const [itens, setItens] = useState<PagamentoHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!alunoId) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(
        `/api/pagamentos?alunoId=${encodeURIComponent(alunoId)}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const msg =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error: string }).error === "string"
            ? (body as { error: string }).error
            : "Erro ao carregar histórico";
        throw new Error(msg);
      }
      const dados = (await res.json()) as PagamentoHistoricoItem[];
      setItens(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar");
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, [alunoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section className="card historico-pagamentos">
      <h2 className="historico-pagamentos-titulo">{titulo}</h2>

      {loading ? (
        <p className="text-muted" style={{ margin: 0 }}>
          Carregando...
        </p>
      ) : erro ? (
        <p className="text-accent" style={{ margin: 0 }}>
          {erro}
        </p>
      ) : itens.length === 0 ? (
        <p className="text-muted" style={{ margin: 0 }}>
          Nenhum pagamento registrado.
        </p>
      ) : (
        <ul className="historico-pagamentos-lista">
          {itens.map((item) => (
            <li key={item.id} className="historico-pagamentos-item">
              <div className="historico-pagamentos-item-top">
                <strong>{PLANOS_LABEL[item.planoId] ?? item.planoId}</strong>
                <span
                  className={`historico-pagamentos-status historico-pagamentos-status--${item.status}`}
                >
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
              <p className="text-muted historico-pagamentos-meta">
                {formatarValor(item.valor)} ·{" "}
                {item.dataPagamento
                  ? `Pago em ${formatarData(item.dataPagamento)}`
                  : `Criado em ${formatarData(item.criadoEm)}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
