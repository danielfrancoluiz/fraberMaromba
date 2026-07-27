"use client";

import { useCallback, useEffect, useState } from "react";
import { formatarPrecoCentavos } from "@/lib/ofertas-planos";

type Oferta = {
  id: string;
  grupo: string;
  nome: string;
  descricao: string | null;
  valorCentavos: number;
  diasValidade: number;
  ativo: boolean;
  badge: string | null;
};

export function OfertasEditorProfessor() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [rascunhos, setRascunhos] = useState<
    Record<string, { reais: string; dias: string; ativo: boolean }>
  >({});

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/ofertas?todas=1", { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao carregar");
      const body = (await res.json()) as Oferta[];
      const lista = Array.isArray(body) ? body : [];
      setOfertas(lista);
      const map: Record<string, { reais: string; dias: string; ativo: boolean }> =
        {};
      for (const o of lista) {
        map[o.id] = {
          reais: (o.valorCentavos / 100).toFixed(2).replace(".", ","),
          dias: String(o.diasValidade),
          ativo: o.ativo,
        };
      }
      setRascunhos(map);
    } catch {
      setErro("Não foi possível carregar as ofertas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvar(id: string) {
    const r = rascunhos[id];
    if (!r) return;
    setSalvandoId(id);
    setMsg(null);
    setErro(null);
    try {
      const reais = Number(r.reais.replace(",", "."));
      const dias = Number(r.dias);
      if (!Number.isFinite(reais) || reais < 0) {
        setErro("Valor inválido.");
        return;
      }
      if (!Number.isFinite(dias) || dias < 1) {
        setErro("Dias inválidos.");
        return;
      }
      const res = await fetch("/api/ofertas", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          valorReais: reais,
          diasValidade: dias,
          ativo: r.ativo,
        }),
      });
      if (!res.ok) {
        setErro("Não foi possível salvar.");
        return;
      }
      const atualizada = (await res.json()) as Oferta;
      setOfertas((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...atualizada } : o))
      );
      setMsg(`Salvo: ${atualizada.nome} (${formatarPrecoCentavos(atualizada.valorCentavos)})`);
    } finally {
      setSalvandoId(null);
    }
  }

  if (loading) {
    return <p className="text-muted">Carregando ofertas...</p>;
  }

  const treino = ofertas.filter((o) => o.grupo === "treino");
  const nutricao = ofertas.filter((o) => o.grupo === "nutricao");

  return (
    <section className="card page-stack">
      <div>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Ofertas dos alunos</h2>
        <p className="text-muted" style={{ margin: "6px 0 0", fontSize: "0.88rem" }}>
          Altere preço e validade aqui. Vale na hora para novas compras.
        </p>
      </div>

      {erro ? <p className="field-error">{erro}</p> : null}
      {msg ? <p className="text-muted" style={{ margin: 0 }}>{msg}</p> : null}

      {[
        { titulo: "Treino (promo)", lista: treino },
        { titulo: "Nutrição", lista: nutricao },
      ].map((bloco) => (
        <div key={bloco.titulo}>
          <p className="field-label">{bloco.titulo}</p>
          <div className="ofertas-editor-lista">
            {bloco.lista.map((o) => {
              const r = rascunhos[o.id];
              if (!r) return null;
              return (
                <div key={o.id} className="ofertas-editor-item">
                  <strong>{o.nome}</strong>
                  <div className="ofertas-editor-grid">
                    <label className="field-label">
                      Preço (R$)
                      <input
                        className="input-field"
                        value={r.reais}
                        onChange={(e) =>
                          setRascunhos((prev) => ({
                            ...prev,
                            [o.id]: { ...prev[o.id], reais: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="field-label">
                      Dias
                      <input
                        className="input-field"
                        type="number"
                        min={1}
                        value={r.dias}
                        onChange={(e) =>
                          setRascunhos((prev) => ({
                            ...prev,
                            [o.id]: { ...prev[o.id], dias: e.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>
                  <label className="ofertas-editor-ativo">
                    <input
                      type="checkbox"
                      checked={r.ativo}
                      onChange={(e) =>
                        setRascunhos((prev) => ({
                          ...prev,
                          [o.id]: { ...prev[o.id], ativo: e.target.checked },
                        }))
                      }
                    />
                    Ativa
                  </label>
                  <button
                    type="button"
                    className="btn-primary btn-compact"
                    disabled={salvandoId === o.id}
                    onClick={() => void salvar(o.id)}
                  >
                    {salvandoId === o.id ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
