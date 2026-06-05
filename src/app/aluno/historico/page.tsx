"use client";

import { useCallback, useEffect, useState } from "react";
import { History, Play } from "lucide-react";
import { TreinoSessao } from "@/types";
import {
  formatarDataSessao,
  formatarDuracaoSessao,
  listarSessoesAluno,
} from "@/services/sessaoService";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

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
      <div className="page-container page-stack">
        <PageHeader title="Histórico" subtitle="Treinos concluídos" />

        {loading ? (
          <p className="loading-center text-muted">Carregando...</p>
        ) : erro ? (
          <p className="error-center text-accent">{erro}</p>
        ) : itens.length === 0 ? (
          <EmptyState
            icon={History}
            title="Nenhum treino concluído ainda"
            description="Quando você finalizar um treino, ele aparecerá aqui com data e duração."
          />
        ) : (
          <>
            <div className="historico-lista">
              {itens.map((sessao) => (
                <article key={sessao.id} className="historico-item card">
                  <div className="historico-item-play" aria-hidden>
                    <Play size={20} fill="currentColor" />
                  </div>
                  <div className="historico-item-body">
                    <div className="historico-item-top">
                      <h2 className="historico-item-titulo">{sessao.treinoNome}</h2>
                      <Badge variant="success">Concluído</Badge>
                    </div>
                    <p className="text-muted historico-item-meta">
                      {formatarDataSessao(sessao.finalizadoEm ?? sessao.iniciadoEm)}
                      {" · "}
                      {formatarDuracaoSessao(sessao.duracaoSegundos)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {pagina < totalPaginas ? (
              <button
                type="button"
                className="btn-secondary"
                disabled={carregandoMais}
                onClick={() => void carregar(pagina + 1, true)}
              >
                {carregandoMais ? "Carregando..." : "Carregar mais"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
