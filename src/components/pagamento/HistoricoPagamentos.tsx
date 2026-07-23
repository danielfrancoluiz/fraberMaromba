"use client";

import { useCallback, useEffect, useState } from "react";

export interface ModuloResumoItem {
  id: string;
  label: string;
  mesesContratados: number;
  venceEm: string | null;
  ativo: boolean;
}

interface HistoricoPagamentosProps {
  alunoId: string;
  titulo?: string;
}

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

function labelMeses(qtd: number): string {
  if (qtd <= 0) return "Nenhum mês pago ainda";
  if (qtd === 1) return "1 mês contratado";
  return `${qtd} meses contratados`;
}

export function HistoricoPagamentos({
  alunoId,
  titulo = "Seus módulos",
}: HistoricoPagamentosProps) {
  const [itens, setItens] = useState<ModuloResumoItem[]>([]);
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
            : "Erro ao carregar módulos";
        throw new Error(msg);
      }
      const dados = (await res.json()) as { modulos?: ModuloResumoItem[] };
      setItens(Array.isArray(dados.modulos) ? dados.modulos : []);
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
          Nenhum módulo contratado ainda.
        </p>
      ) : (
        <ul className="historico-pagamentos-lista">
          {itens.map((item) => (
            <li key={item.id} className="historico-pagamentos-item">
              <div className="historico-pagamentos-item-top">
                <strong>{item.label}</strong>
                <span
                  className={`historico-pagamentos-status historico-pagamentos-status--${item.ativo ? "pago" : "cancelado"}`}
                >
                  {item.ativo ? "Ativo" : "Encerrado"}
                </span>
              </div>
              <p className="text-muted historico-pagamentos-meta">
                {labelMeses(item.mesesContratados)}
                {item.venceEm
                  ? ` · ${item.ativo ? "Termina em" : "Terminou em"} ${formatarData(item.venceEm)}`
                  : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
