"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wind } from "lucide-react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { CorridaEstruturaView } from "@/components/corrida/CorridaEstruturaView";
import type { TreinoCorridaDTO } from "@/lib/treino-corrida";
import { parseDataISO } from "@/lib/treino-corrida";

function formatarDia(iso: string): string {
  return parseDataISO(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function Page() {
  const router = useRouter();
  const [itens, setItens] = useState<TreinoCorridaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/professor/corrida", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao carregar");
      const dados = (await res.json()) as TreinoCorridaDTO[];
      setItens(Array.isArray(dados) ? dados : []);
    } catch {
      setErro("Não foi possível carregar os treinos de corrida.");
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Corrida"
          subtitle="Treinos prescritos para os alunos"
          onBack={() => router.push("/professor/dashboard")}
        />

        <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Para criar: abra o aluno → <strong>Treino de corrida</strong>.
        </p>

        {loading ? (
          <p className="text-muted">Carregando...</p>
        ) : erro ? (
          <p className="field-error">{erro}</p>
        ) : itens.length === 0 ? (
          <EmptyState
            icon={Wind}
            title="Nenhum treino de corrida"
            description="Monte o primeiro a partir do perfil do aluno."
          />
        ) : (
          <ul className="corrida-lista-prof">
            {itens.map((t) => (
              <li key={t.id} className="card corrida-lista-item">
                <div className="corrida-lista-item-top">
                  <div>
                    <strong>{t.titulo}</strong>
                    <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                      {t.alunoNome ?? "Aluno"} · {formatarDia(t.data)}
                    </p>
                  </div>
                  <span className="corrida-status-pill">{t.status}</span>
                </div>
                <CorridaEstruturaView estrutura={t.estrutura} compact />
                {t.status === "concluido" || t.feedbackTexto || t.feedbackNota ? (
                  <div className="corrida-feedback-prof">
                    {t.status === "concluido" ? (
                      <p className="corrida-feedback-ok" style={{ marginBottom: 4 }}>
                        Concluído pelo aluno
                        {t.concluidoEm
                          ? ` em ${new Date(t.concluidoEm).toLocaleDateString("pt-BR")}`
                          : ""}
                      </p>
                    ) : null}
                    {t.feedbackNota ? (
                      <p className="text-muted" style={{ margin: "0 0 4px", fontSize: "0.85rem" }}>
                        Nota: {t.feedbackNota}/5
                      </p>
                    ) : null}
                    {t.feedbackTexto ? (
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>&ldquo;{t.feedbackTexto}&rdquo;</p>
                    ) : null}
                  </div>
                ) : null}
                <div className="action-row" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary btn-compact"
                    onClick={() =>
                      router.push(`/professor/corrida/${encodeURIComponent(t.id)}`)
                    }
                  >
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className="btn-primary"
          onClick={() => router.push("/professor/alunos")}
        >
          <Plus size={16} /> Escolher aluno
        </button>
      </div>
    </main>
  );
}
