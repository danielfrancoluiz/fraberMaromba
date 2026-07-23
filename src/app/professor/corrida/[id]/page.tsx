"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { CorridaBuilder } from "@/components/corrida/CorridaBuilder";
import {
  type EstruturaCorrida,
  type TreinoCorridaDTO,
} from "@/lib/treino-corrida";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [observacao, setObservacao] = useState("");
  const [estrutura, setEstrutura] = useState<EstruturaCorrida>([]);
  const [alunoId, setAlunoId] = useState("");
  const [alunoNome, setAlunoNome] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/professor/corrida/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setNaoEncontrado(true);
        return;
      }
      const t = (await res.json()) as TreinoCorridaDTO;
      setTitulo(t.titulo);
      setData(t.data);
      setObservacao(t.observacao ?? "");
      setEstrutura(t.estrutura);
      setAlunoId(t.alunoId);
      setAlunoNome(t.alunoNome ?? "");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvar() {
    setSaving(true);
    setErro(null);
    try {
      const res = await fetch(`/api/professor/corrida/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim() || "Corrida",
          data,
          observacao: observacao.trim() || null,
          estrutura,
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
      router.push(
        alunoId
          ? `/professor/alunos/${encodeURIComponent(alunoId)}`
          : "/professor/corrida"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page-main">
        <p className="text-muted">Carregando...</p>
      </main>
    );
  }

  if (naoEncontrado) {
    return (
      <main className="page-main">
        <div className="page-container">
          <p>Treino não encontrado.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/professor/corrida")}
          >
            Voltar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Editar corrida"
          onBack={() => router.push("/professor/corrida")}
        />
        <CorridaBuilder
          alunoNome={alunoNome}
          titulo={titulo}
          data={data}
          observacao={observacao}
          estrutura={estrutura}
          onTitulo={setTitulo}
          onData={setData}
          onObservacao={setObservacao}
          onEstrutura={setEstrutura}
          saving={saving}
          erro={erro}
          onSalvar={() => void salvar()}
          onCancelar={() => router.push("/professor/corrida")}
        />
      </div>
    </main>
  );
}
