"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, History } from "lucide-react";
import { TreinoSessao } from "@/types";
import {
  formatarDataSessao,
  formatarDuracaoSessao,
  listarSessoesAluno,
} from "@/services/sessaoService";

export default function Page() {
  const [itens, setItens] = useState<TreinoSessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregandoMais, setCarregandoMais] = useState(false);

  const carregar = useCallback(async (pag: number, append: boolean) => {
    if (pag === 1) setLoading(true);
    else setCarregandoMais(true);
    setErro(null);

    try {
      const dados = await listarSessoesAluno(pag, 12);
      setItens((prev) => (append ? [...prev, ...dados.itens] : dados.itens));
      setPagina(dados.paginacao.pagina);
      setTotalPaginas(dados.paginacao.totalPaginas);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar histórico");
      if (!append) setItens([]);
    } finally {
      setLoading(false);
      setCarregandoMais(false);
    }
  }, []);

  useEffect(() => {
    void carregar(1, false);
  }, [carregar]);

  return (
    <main className="page-main">
      <div className="page-container" style={{ paddingTop: "1rem" }}>
        <header style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Histórico</h1>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
            Treinos concluídos
          </p>
        </header>

        {loading ? (
          <p className="text-muted" style={{ textAlign: "center", margin: "2rem 0" }}>
            Carregando...
          </p>
        ) : erro ? (
          <p className="text-accent" style={{ textAlign: "center", margin: "2rem 0" }}>
            {erro}
          </p>
        ) : itens.length === 0 ? (
          <div className="card historico-empty">
            <History
              size={40}
              style={{
                margin: "0 auto 12px",
                display: "block",
                color: "var(--fraber-text-muted)",
              }}
            />
            <p style={{ margin: 0, fontWeight: 600, textAlign: "center" }}>
              Nenhum treino concluído ainda
            </p>
            <p
              className="text-muted"
              style={{ margin: "8px 0 0", fontSize: "0.875rem", textAlign: "center" }}
            >
              Quando você finalizar um treino, ele aparecerá aqui com data e duração.
            </p>
          </div>
        ) : (
          <div className="historico-lista">
            {itens.map((sessao) => (
              <article key={sessao.id} className="historico-item card">
                <div className="historico-item-play" aria-hidden>
                  <Play size={20} fill="currentColor" />
                </div>
                <div className="historico-item-body">
                  <div className="historico-item-top">
                    <h2 className="historico-item-titulo">{sessao.treinoNome}</h2>
                    <span className="historico-badge">Concluído</span>
                  </div>
                  <p className="text-muted historico-item-meta">
                    {formatarDataSessao(sessao.finalizadoEm ?? sessao.iniciadoEm)}
                    {" · "}
                    {formatarDuracaoSessao(sessao.duracaoSegundos)}
                  </p>
                </div>
              </article>
            ))}

            {pagina < totalPaginas ? (
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={carregandoMais}
                onClick={() => void carregar(pagina + 1, true)}
              >
                {carregandoMais ? "Carregando..." : "Carregar mais"}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
