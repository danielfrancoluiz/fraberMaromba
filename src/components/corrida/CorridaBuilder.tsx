"use client";

import { useMemo, useState } from "react";
import { Plus, Repeat, Trash2 } from "lucide-react";
import {
  ACOES_CORRIDA,
  METRICAS_CORRIDA,
  MODELOS_CORRIDA,
  ZONAS_CORRIDA,
  blocoRepetirVazio,
  passoVazio,
  type AcaoCorridaId,
  type BlocoRepetirCorrida,
  type EstruturaCorrida,
  type MetricaCorridaId,
  type PassoCorrida,
} from "@/lib/treino-corrida";
import { CorridaEstruturaView } from "@/components/corrida/CorridaEstruturaView";

interface CorridaBuilderProps {
  titulo: string;
  data: string;
  observacao: string;
  estrutura: EstruturaCorrida;
  onTitulo: (v: string) => void;
  onData: (v: string) => void;
  onObservacao: (v: string) => void;
  onEstrutura: (v: EstruturaCorrida) => void;
  saving?: boolean;
  erro?: string | null;
  onSalvar: () => void;
  onCancelar: () => void;
  alunoNome?: string;
}

function atualizarPasso(
  estrutura: EstruturaCorrida,
  passoId: string,
  patch: Partial<PassoCorrida>,
  parentBlocoId?: string
): EstruturaCorrida {
  return estrutura.map((item) => {
    if (item.tipo === "passo" && item.id === passoId && !parentBlocoId) {
      return { ...item, ...patch, tipo: "passo" };
    }
    if (item.tipo === "repetir" && item.id === parentBlocoId) {
      return {
        ...item,
        passos: item.passos.map((p) =>
          p.id === passoId ? { ...p, ...patch, tipo: "passo" as const } : p
        ),
      };
    }
    return item;
  });
}

function PassoEditor({
  passo,
  onChange,
  onRemove,
}: {
  passo: PassoCorrida;
  onChange: (patch: Partial<PassoCorrida>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="corrida-editor-passo">
      <div className="corrida-editor-passo-head">
        <select
          className="input-field"
          value={passo.acao}
          onChange={(e) => onChange({ acao: e.target.value as AcaoCorridaId })}
          aria-label="Ação"
        >
          {ACOES_CORRIDA.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-ghost corrida-icon-btn"
          onClick={onRemove}
          aria-label="Remover passo"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="corrida-editor-grid">
        <label className="field-label">
          Medida
          <select
            className="input-field"
            value={passo.metrica}
            onChange={(e) => {
              const metrica = e.target.value as MetricaCorridaId;
              if (metrica === "distancia") {
                onChange({
                  metrica,
                  distanciaMetros: passo.distanciaMetros ?? 400,
                  duracaoSegundos: undefined,
                });
              } else if (metrica === "tempo") {
                onChange({
                  metrica,
                  duracaoSegundos: passo.duracaoSegundos ?? 60,
                  distanciaMetros: undefined,
                });
              } else {
                onChange({
                  metrica,
                  distanciaMetros: undefined,
                  duracaoSegundos: undefined,
                });
              }
            }}
          >
            {METRICAS_CORRIDA.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        {passo.metrica === "distancia" ? (
          <label className="field-label">
            Metros
            <input
              type="number"
              className="input-field"
              min={50}
              step={50}
              value={passo.distanciaMetros ?? ""}
              onChange={(e) =>
                onChange({ distanciaMetros: Number(e.target.value) || undefined })
              }
            />
          </label>
        ) : null}

        {passo.metrica === "tempo" ? (
          <label className="field-label">
            Segundos
            <input
              type="number"
              className="input-field"
              min={10}
              step={10}
              value={passo.duracaoSegundos ?? ""}
              onChange={(e) =>
                onChange({ duracaoSegundos: Number(e.target.value) || undefined })
              }
            />
          </label>
        ) : null}

        <label className="field-label">
          Zona
          <select
            className="input-field"
            value={passo.zona ?? ""}
            onChange={(e) => onChange({ zona: e.target.value || undefined })}
          >
            <option value="">Sem zona</option>
            {ZONAS_CORRIDA.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field-label">
        Nota (ex.: ritmo mais forte)
        <input
          className="input-field"
          value={passo.nota ?? ""}
          onChange={(e) => onChange({ nota: e.target.value || undefined })}
          placeholder="Ritmo mais forte"
        />
      </label>

      <label className="field-label">
        Orientação
        <input
          className="input-field"
          value={passo.observacao ?? ""}
          onChange={(e) => onChange({ observacao: e.target.value || undefined })}
          placeholder="Caminhada focada na técnica"
        />
      </label>
    </div>
  );
}

export function CorridaBuilder({
  titulo,
  data,
  observacao,
  estrutura,
  onTitulo,
  onData,
  onObservacao,
  onEstrutura,
  saving,
  erro,
  onSalvar,
  onCancelar,
  alunoNome,
}: CorridaBuilderProps) {
  const [mostrarPreview, setMostrarPreview] = useState(true);

  const resumo = useMemo(() => {
    const passos = estrutura.reduce((acc, item) => {
      if (item.tipo === "passo") return acc + 1;
      return acc + 1 + item.passos.length;
    }, 0);
    return `${estrutura.length} bloco(s) · ${passos} linha(s)`;
  }, [estrutura]);

  function addPasso(acao: AcaoCorridaId = "correr") {
    onEstrutura([...estrutura, passoVazio(acao)]);
  }

  function addBloco() {
    onEstrutura([...estrutura, blocoRepetirVazio(6)]);
  }

  function removeItem(id: string) {
    onEstrutura(estrutura.filter((i) => i.id !== id));
  }

  function updateBloco(id: string, patch: Partial<BlocoRepetirCorrida>) {
    onEstrutura(
      estrutura.map((item) =>
        item.tipo === "repetir" && item.id === id ? { ...item, ...patch } : item
      )
    );
  }

  return (
    <div className="corrida-builder page-stack">
      {alunoNome ? (
        <p className="text-muted" style={{ margin: 0 }}>
          Aluno: <strong>{alunoNome}</strong>
        </p>
      ) : null}

      <label className="field-label">
        Título do treino
        <input
          className="input-field"
          value={titulo}
          onChange={(e) => onTitulo(e.target.value)}
          placeholder="Corrida — intervalado"
        />
      </label>

      <label className="field-label">
        Data
        <input
          type="date"
          className="input-field"
          value={data}
          onChange={(e) => onData(e.target.value)}
        />
      </label>

      <label className="field-label">
        Observação geral (opcional)
        <textarea
          className="input-field"
          rows={2}
          value={observacao}
          onChange={(e) => onObservacao(e.target.value)}
          placeholder="Hidrate bem. Se sentir dor, pare."
        />
      </label>

      <div>
        <p className="field-label" style={{ marginBottom: 8 }}>
          Começar de um modelo
        </p>
        <div className="corrida-modelos">
          {MODELOS_CORRIDA.map((m) => (
            <button
              key={m.id}
              type="button"
              className="corrida-modelo-btn"
              onClick={() => {
                onEstrutura(m.estrutura());
                if (!titulo.trim()) onTitulo(m.nome);
              }}
            >
              <strong>{m.nome}</strong>
              <span>{m.descricao}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="corrida-builder-actions">
        <button type="button" className="btn-secondary btn-compact" onClick={() => addPasso("aquecer")}>
          <Plus size={16} /> Passo
        </button>
        <button type="button" className="btn-secondary btn-compact" onClick={addBloco}>
          <Repeat size={16} /> Bloco repetir
        </button>
      </div>

      <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
        {resumo}
      </p>

      <div className="corrida-editor-lista">
        {estrutura.map((item) => {
          if (item.tipo === "passo") {
            return (
              <PassoEditor
                key={item.id}
                passo={item}
                onChange={(patch) =>
                  onEstrutura(atualizarPasso(estrutura, item.id, patch))
                }
                onRemove={() => removeItem(item.id)}
              />
            );
          }

          return (
            <div key={item.id} className="corrida-editor-bloco">
              <div className="corrida-editor-passo-head">
                <label className="field-label" style={{ flex: 1, margin: 0 }}>
                  Repetir
                  <input
                    type="number"
                    className="input-field"
                    min={1}
                    max={30}
                    value={item.vezes}
                    onChange={(e) =>
                      updateBloco(item.id, {
                        vezes: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn-ghost corrida-icon-btn"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remover bloco"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {item.passos.map((passo) => (
                <PassoEditor
                  key={passo.id}
                  passo={passo}
                  onChange={(patch) =>
                    onEstrutura(
                      atualizarPasso(estrutura, passo.id, patch, item.id)
                    )
                  }
                  onRemove={() =>
                    updateBloco(item.id, {
                      passos: item.passos.filter((p) => p.id !== passo.id),
                    })
                  }
                />
              ))}

              <button
                type="button"
                className="btn-secondary btn-compact"
                onClick={() =>
                  updateBloco(item.id, {
                    passos: [...item.passos, passoVazio("correr")],
                  })
                }
              >
                <Plus size={14} /> Passo no bloco
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-ghost"
        onClick={() => setMostrarPreview((v) => !v)}
      >
        {mostrarPreview ? "Ocultar como o aluno vê" : "Ver como o aluno vê"}
      </button>

      {mostrarPreview && estrutura.length > 0 ? (
        <article className="card corrida-preview">
          <p className="corrida-preview-badge">Planejado</p>
          <h3 style={{ margin: "0 0 12px" }}>{titulo || "Corrida"}</h3>
          <CorridaEstruturaView estrutura={estrutura} />
        </article>
      ) : null}

      {erro ? <p className="field-error">{erro}</p> : null}

      <div className="corrida-builder-footer">
        <button type="button" className="btn-secondary" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={saving}
          onClick={onSalvar}
        >
          {saving ? "Salvando..." : "Salvar treino"}
        </button>
      </div>
    </div>
  );
}
