"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Dumbbell, Plus, Search } from "lucide-react";
import { listarExerciciosProfessor } from "@/services/exercicioCatalogoService";
import { ExercicioCatalogo } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { labelGrupoMuscular } from "@/lib/grupos-musculares";
import { labelSubGrupoMuscular } from "@/lib/sub-grupos-musculares";

export default function Page() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState<ExercicioCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const lista = await listarExerciciosProfessor(busca);
      setItens(lista);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar");
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void carregar();
    }, 300);
    return () => clearTimeout(timer);
  }, [carregar]);

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageHeader
          title="Exercícios"
          subtitle="Seu catálogo personalizado de exercícios"
        />

        <div className="exercise-picker-search">
          <Search size={16} className="exercise-picker-search-icon" />
          <input
            className="input-field"
            placeholder="Buscar exercício..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="loading-center text-muted">Carregando...</p>
        ) : erro ? (
          <p className="error-center text-accent">{erro}</p>
        ) : itens.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="Nenhum exercício criado"
            description="Cadastre exercícios com vídeo, membro e parâmetros de treino."
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={() => router.push("/professor/exercicios/novo")}
              >
                Criar exercício
              </button>
            }
          />
        ) : (
          <div className="exercicios-catalogo-grid">
            {itens.map((item) => (
              <article key={item.id} className="exercicio-catalogo-card card">
                {item.gifUrl ? (
                  <img
                    src={item.gifUrl}
                    alt=""
                    className="exercicio-catalogo-card-media"
                  />
                ) : (
                  <div className="exercicio-catalogo-card-media exercicio-catalogo-card-media--empty">
                    <Dumbbell size={28} />
                  </div>
                )}
                <div className="exercicio-catalogo-card-body">
                  <h3 className="exercicio-catalogo-card-title">{item.nome}</h3>
                  <p className="exercicio-catalogo-card-meta">
                    {labelGrupoMuscular(item.grupoMuscular)}
                    {item.subGrupoMuscular
                      ? ` · ${labelSubGrupoMuscular(item.grupoMuscular, item.subGrupoMuscular)}`
                      : ""}
                  </p>
                  <p className="exercicio-catalogo-card-stats">
                    {item.seriesPadrao ?? 3}×{item.repeticoesPadrao ?? 12} ·{" "}
                    {item.descansoPadrao ?? 60}s descanso
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/professor/exercicios/novo")}
        className="fab-primary"
      >
        <Plus size={18} />
        Novo exercício
      </button>
    </main>
  );
}
