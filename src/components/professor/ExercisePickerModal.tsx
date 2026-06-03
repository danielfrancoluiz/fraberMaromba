"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { listarExerciciosCatalogo } from "@/services/exercicioCatalogoService";
import { ExercicioCatalogo } from "@/types";
import { GRUPOS_MUSCULARES, labelGrupoMuscular } from "@/lib/grupos-musculares";

interface ExercisePickerModalProps {
  open: boolean;
  onFechar: () => void;
  onSelecionar: (exercicio: ExercicioCatalogo) => void;
}

export function ExercisePickerModal({
  open,
  onFechar,
  onSelecionar,
}: ExercisePickerModalProps) {
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState("");
  const [itens, setItens] = useState<ExercicioCatalogo[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async (paginaAtual: number, resetLista: boolean) => {
    setLoading(true);
    setErro(null);
    try {
      const res = await listarExerciciosCatalogo({
        busca,
        grupo: grupo || undefined,
        pagina: paginaAtual,
        limite: 20,
      });
      setItens((prev) => (resetLista ? res.itens : [...prev, ...res.itens]));
      setPagina(res.paginacao.pagina);
      setTotalPaginas(res.paginacao.totalPaginas);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar");
      if (resetLista) setItens([]);
    } finally {
      setLoading(false);
    }
  }, [busca, grupo]);

  useEffect(() => {
    if (!open) return;
    setBusca("");
    setGrupo("");
    setPagina(1);
    setItens([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      void carregar(1, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [open, busca, grupo, carregar]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-picker-title"
        className="modal-overlay"
        onClick={onFechar}
      >
        <div
          className="card exercise-picker"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-form-header">
            <h2 id="exercise-picker-title" style={{ margin: 0, fontSize: "1.1rem" }}>
              Escolher exercício
            </h2>
            <button type="button" onClick={onFechar} className="modal-close-btn" aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          <div className="exercise-picker-search">
            <Search size={16} className="exercise-picker-search-icon" />
            <input
              className="input-field"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="chip-group">
            <button
              type="button"
              className={`chip ${grupo === "" ? "chip-active" : ""}`}
              onClick={() => setGrupo("")}
            >
              Todos
            </button>
            {GRUPOS_MUSCULARES.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`chip ${grupo === g.id ? "chip-active" : ""}`}
                onClick={() => setGrupo(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          {erro ? (
            <p className="text-accent" style={{ margin: 0, fontSize: "0.875rem" }}>
              {erro}
            </p>
          ) : null}

          <div className="exercise-picker-lista">
            {loading && itens.length === 0 ? (
              <p className="text-muted" style={{ textAlign: "center", margin: "1rem 0" }}>
                Carregando...
              </p>
            ) : itens.length === 0 ? (
              <p className="text-muted" style={{ textAlign: "center", margin: "1rem 0" }}>
                Nenhum exercício encontrado.
              </p>
            ) : (
              itens.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="exercise-picker-item"
                  onClick={() => {
                    onSelecionar(item);
                    onFechar();
                  }}
                >
                  <div className="exercise-picker-thumb">
                    {item.imagemUrl || item.gifUrl ? (
                      <img
                        src={item.imagemUrl ?? item.gifUrl ?? ""}
                        alt=""
                        width={48}
                        height={48}
                      />
                    ) : (
                      <span className="exercise-picker-thumb-fallback">
                        {item.nome.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="exercise-picker-item-info">
                    <p className="exercise-picker-item-nome">{item.nome}</p>
                    <p className="exercise-picker-item-grupo">
                      {labelGrupoMuscular(item.grupoMuscular)}
                      {item.equipamento ? ` · ${item.equipamento}` : ""}
                    </p>
                  </div>
                  <Plus size={18} style={{ flexShrink: 0, color: "var(--fraber-primary)" }} />
                </button>
              ))
            )}
          </div>

          {pagina < totalPaginas ? (
            <button
              type="button"
              className="chip"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
              onClick={() => void carregar(pagina + 1, false)}
            >
              {loading ? "Carregando..." : "Carregar mais"}
            </button>
          ) : null}
        </div>
      </div>
    </ModalPortal>
  );
}
