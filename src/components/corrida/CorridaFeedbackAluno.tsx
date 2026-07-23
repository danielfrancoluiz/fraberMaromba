"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";
import type { TreinoCorridaDTO } from "@/lib/treino-corrida";

interface CorridaFeedbackAlunoProps {
  treino: TreinoCorridaDTO;
  onAtualizado: (treino: TreinoCorridaDTO) => void;
}

export function CorridaFeedbackAluno({
  treino,
  onAtualizado,
}: CorridaFeedbackAlunoProps) {
  const [texto, setTexto] = useState(treino.feedbackTexto ?? "");
  const [nota, setNota] = useState<number>(treino.feedbackNota ?? 0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const concluido = treino.status === "concluido";

  async function enviar(concluir: boolean) {
    setSaving(true);
    setErro(null);
    try {
      const res = await fetch(`/api/aluno/corrida/${encodeURIComponent(treino.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concluir,
          feedbackTexto: texto.trim() || null,
          feedbackNota: nota >= 1 ? nota : undefined,
        }),
      });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error: string }).error === "string"
            ? (body as { error: string }).error
            : "Não foi possível salvar";
        setErro(msg);
        return;
      }
      onAtualizado(body as TreinoCorridaDTO);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="corrida-feedback">
      {concluido ? (
        <p className="corrida-feedback-ok">
          <Check size={16} aria-hidden /> Treino concluído
          {treino.concluidoEm
            ? ` · ${new Date(treino.concluidoEm).toLocaleDateString("pt-BR")}`
            : ""}
        </p>
      ) : null}

      <p className="field-label" style={{ marginBottom: 6 }}>
        Como foi o treino?
      </p>
      <div className="corrida-estrelas" role="group" aria-label="Nota de 1 a 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`corrida-estrela${nota >= n ? " corrida-estrela--on" : ""}`}
            onClick={() => setNota(n)}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            disabled={saving}
          >
            <Star size={22} fill={nota >= n ? "currentColor" : "none"} />
          </button>
        ))}
      </div>

      <label className="field-label">
        Feedback (opcional)
        <textarea
          className="input-field"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex.: Ritmo ficou forte no último tiro, mas completei."
          disabled={saving}
        />
      </label>

      {erro ? <p className="field-error">{erro}</p> : null}

      <div className="corrida-feedback-acoes">
        {!concluido ? (
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() => void enviar(true)}
          >
            {saving ? "Salvando..." : "Marcar como concluído"}
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            disabled={saving}
            onClick={() => void enviar(false)}
          >
            {saving ? "Salvando..." : "Atualizar feedback"}
          </button>
        )}
      </div>
    </div>
  );
}
