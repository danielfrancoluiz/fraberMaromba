"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Wind } from "lucide-react";
import { CorridaEstruturaView } from "@/components/corrida/CorridaEstruturaView";
import { CorridaFeedbackAluno } from "@/components/corrida/CorridaFeedbackAluno";
import { OfertasContratar } from "@/components/pagamento/OfertasContratar";
import { EmptyState } from "@/components/ui/EmptyState";
import { moduloVigente, type ModuloAlunoId } from "@/lib/modulos-aluno";
import {
  dataISOLocal,
  parseDataISO,
  type TreinoCorridaDTO,
} from "@/lib/treino-corrida";

function addDays(iso: string, delta: number): string {
  const d = parseDataISO(iso);
  d.setDate(d.getDate() + delta);
  return dataISOLocal(d);
}

function labelPill(iso: string): { dia: string; num: string } {
  const d = parseDataISO(iso);
  const dia = d
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .toUpperCase();
  const num = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  return { dia, num };
}

function faixaSemana(centro: string): string[] {
  return [-3, -2, -1, 0, 1, 2, 3].map((n) => addDays(centro, n));
}

function temCorridaAtiva(user: {
  modulosAtivos?: string[];
  modulosVencimentos?: Partial<Record<string, string>>;
} | null | undefined): boolean {
  if (!user) return false;
  const venc = user.modulosVencimentos;
  if (venc && Object.keys(venc).length > 0) {
    return moduloVigente(venc.corrida);
  }
  return (user.modulosAtivos ?? []).includes("corrida");
}

export default function Page() {
  const { data: session, update, status } = useSession();
  const alunoId = session?.user?.alunoId ?? "";
  const [acessoOk, setAcessoOk] = useState<boolean | null>(null);

  const hoje = dataISOLocal();
  const [selecionado, setSelecionado] = useState(hoje);
  const [treinos, setTreinos] = useState<TreinoCorridaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const dias = useMemo(() => faixaSemana(selecionado), [selecionado]);

  // Sincroniza JWT com o banco (pós-pagamento / sessão atrasada).
  useEffect(() => {
    if (status !== "authenticated") return;
    let ativo = true;

    async function syncAcesso() {
      if (temCorridaAtiva(session?.user)) {
        if (ativo) setAcessoOk(true);
        return;
      }

      try {
        const res = await fetch("/api/aluno/acesso", { credentials: "include" });
        if (!res.ok) {
          if (ativo) setAcessoOk(false);
          return;
        }
        const body = (await res.json()) as {
          modulosAtivos?: ModuloAlunoId[];
          modulosVencimentos?: Partial<Record<ModuloAlunoId, string>>;
          planoVenceEm?: string | null;
          planoId?: string | null;
          status?: string;
        };
        await update({
          modulosAtivos: body.modulosAtivos,
          modulosVencimentos: body.modulosVencimentos,
          planoVenceEm: body.planoVenceEm,
          planoId: body.planoId,
          status: body.status,
        });
        if (ativo) {
          setAcessoOk(
            temCorridaAtiva({
              modulosAtivos: body.modulosAtivos,
              modulosVencimentos: body.modulosVencimentos,
            })
          );
        }
      } catch {
        if (ativo) setAcessoOk(temCorridaAtiva(session?.user));
      }
    }

    void syncAcesso();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync uma vez ao autenticar
  }, [status, alunoId]);

  const carregar = useCallback(async (de: string, ate: string) => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(
        `/api/aluno/corrida?de=${encodeURIComponent(de)}&ate=${encodeURIComponent(ate)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("erro");
      const dados = (await res.json()) as TreinoCorridaDTO[];
      setTreinos(Array.isArray(dados) ? dados : []);
    } catch {
      setErro("Não foi possível carregar seus treinos de corrida.");
      setTreinos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (acessoOk !== true) return;
    const de = dias[0];
    const ate = dias[dias.length - 1];
    void carregar(de, ate);
  }, [acessoOk, carregar, dias]);

  const doDia = treinos.filter((t) => t.data === selecionado);
  const datasComTreino = useMemo(
    () => new Set(treinos.map((t) => t.data)),
    [treinos]
  );

  function atualizarTreino(atualizado: TreinoCorridaDTO) {
    setTreinos((prev) =>
      prev.map((t) => (t.id === atualizado.id ? atualizado : t))
    );
  }

  return (
    <main className="page-main">
      <div className="page-container page-stack corrida-aluno">
        <header className="corrida-aluno-header">
          <div className="corrida-aluno-title-row">
            <Wind size={22} aria-hidden />
            <div>
              <h1 className="page-header-title" style={{ margin: 0 }}>
                Corrida
              </h1>
              <p
                className="text-muted"
                style={{ margin: "2px 0 0", fontSize: "0.85rem" }}
              >
                {acessoOk
                  ? "Seu plano do dia, passo a passo"
                  : "Contrate o módulo para ver seus treinos"}
              </p>
            </div>
          </div>
        </header>

        {status === "loading" || acessoOk === null ? (
          <p className="text-muted">Carregando...</p>
        ) : !acessoOk ? (
          alunoId ? (
            <OfertasContratar
              alunoId={alunoId}
              grupo="treino"
              titulo="Contratar corrida"
              subtitulo="Escolha a oferta de corrida ou o combo com musculação."
              modulosAtuais={session?.user?.modulosAtivos ?? []}
              modulosVencimentos={session?.user?.modulosVencimentos ?? null}
            />
          ) : (
            <p className="text-muted">Faça login como aluno para contratar.</p>
          )
        ) : (
          <>
            <div className="corrida-date-strip" role="tablist" aria-label="Dias">
              {dias.map((iso) => {
                const { dia, num } = labelPill(iso);
                const ativo = iso === selecionado;
                const tem = datasComTreino.has(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    role="tab"
                    aria-selected={ativo}
                    className={`corrida-date-pill${ativo ? " corrida-date-pill--ativo" : ""}${tem ? " corrida-date-pill--tem" : ""}`}
                    onClick={() => setSelecionado(iso)}
                  >
                    <span>{dia}.</span>
                    <strong>{num}</strong>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <p className="text-muted">Carregando...</p>
            ) : erro ? (
              <p className="field-error">{erro}</p>
            ) : doDia.length === 0 ? (
              <EmptyState
                icon={Wind}
                title="Nada prescrito neste dia"
                description="Quando seu professor montar a corrida, ela aparece aqui."
              />
            ) : (
              doDia.map((treino) => (
                <article key={treino.id} className="card corrida-dia-card">
                  <div className="corrida-dia-card-head">
                    <div>
                      <p className="corrida-dia-tipo">
                        <Wind size={16} aria-hidden /> Corrida
                      </p>
                      <h2 className="corrida-dia-titulo">{treino.titulo}</h2>
                    </div>
                    <span className="corrida-preview-badge">
                      {treino.status === "concluido" ? "Concluído" : "Planejado"}
                    </span>
                  </div>

                  {treino.observacao ? (
                    <p className="corrida-dia-obs">{treino.observacao}</p>
                  ) : null}

                  <CorridaEstruturaView estrutura={treino.estrutura} />

                  <CorridaFeedbackAluno
                    treino={treino}
                    onAtualizado={atualizarTreino}
                  />
                </article>
              ))
            )}
          </>
        )}
      </div>
    </main>
  );
}
