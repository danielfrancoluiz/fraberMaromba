"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TreinoTemplate } from "@/types";

interface EditarTemplateModalProps {
  template: TreinoTemplate;
  onFechar: () => void;
  onSalvar: (dados: {
    nome: string;
    descricao: string;
    exercicios: TreinoTemplate["exercicios"];
  }) => Promise<void>;
}

export function EditarTemplateModal({
  template,
  onFechar,
  onSalvar,
}: EditarTemplateModalProps) {
  const [nome, setNome] = useState(template.nome);
  const [descricao, setDescricao] = useState(template.descricao ?? "");
  const [exercicios, setExercicios] = useState(template.exercicios);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }

    setLoading(true);
    setErro(null);
    try {
      await onSalvar({ nome: nome.trim(), descricao: descricao.trim(), exercicios });
      onFechar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  function atualizarExercicio(
    index: number,
    campo: "nome" | "series" | "repeticoes" | "grupoMuscular",
    valor: string
  ) {
    setExercicios((prev) =>
      prev.map((ex, i) => {
        if (i !== index) return ex;
        if (campo === "series" || campo === "repeticoes") {
          const num = Number.parseInt(valor, 10);
          return { ...ex, [campo]: Number.isNaN(num) ? 0 : num };
        }
        return { ...ex, [campo]: valor };
      })
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(5, 15, 26, 0.75)",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
      onClick={onFechar}
    >
      <form
        className="card"
        style={{ width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Editar template</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" style={{ border: "none", background: "transparent", color: "var(--fraber-text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <label className="text-muted" style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Nome</label>
            <input className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <label className="text-muted" style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Descrição</label>
            <input className="input-field" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>

          <div>
            <p style={{ margin: "0 0 8px", fontSize: "0.875rem", fontWeight: 600 }}>Exercícios</p>
            <div style={{ display: "grid", gap: "8px" }}>
              {exercicios.map((ex, index) => (
                <div key={ex.id} className="card" style={{ padding: "10px", background: "var(--fraber-bg-soft)" }}>
                  <input
                    className="input-field"
                    value={ex.nome}
                    onChange={(e) => atualizarExercicio(index, "nome", e.target.value)}
                    style={{ marginBottom: "6px" }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                    <input
                      className="input-field"
                      type="number"
                      min={1}
                      value={ex.series}
                      onChange={(e) => atualizarExercicio(index, "series", e.target.value)}
                      placeholder="Séries"
                    />
                    <input
                      className="input-field"
                      type="number"
                      min={1}
                      value={ex.repeticoes}
                      onChange={(e) => atualizarExercicio(index, "repeticoes", e.target.value)}
                      placeholder="Reps"
                    />
                    <input
                      className="input-field"
                      value={ex.grupoMuscular ?? ""}
                      onChange={(e) => atualizarExercicio(index, "grupoMuscular", e.target.value)}
                      placeholder="Grupo"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {erro ? <p className="text-accent" style={{ margin: 0, fontSize: "0.875rem" }}>{erro}</p> : null}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
