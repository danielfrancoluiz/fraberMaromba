"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { CorridaBuilder } from "@/components/corrida/CorridaBuilder";
import {
  MODELOS_CORRIDA,
  dataISOLocal,
  type EstruturaCorrida,
} from "@/lib/treino-corrida";

function NovoCorridaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alunoId = searchParams.get("alunoId")?.trim() ?? "";

  const [alunoNome, setAlunoNome] = useState<string>("");
  const [titulo, setTitulo] = useState("Corrida");
  const [data, setData] = useState(dataISOLocal());
  const [observacao, setObservacao] = useState("");
  const [estrutura, setEstrutura] = useState<EstruturaCorrida>(() =>
    MODELOS_CORRIDA[0].estrutura()
  );
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!alunoId) return;
    let ativo = true;
    void fetch(`/api/professor/alunos/${encodeURIComponent(alunoId)}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: unknown) => {
        if (!ativo || !body || typeof body !== "object") return;
        const nome = (body as { nomeCompleto?: string }).nomeCompleto;
        if (typeof nome === "string") setAlunoNome(nome);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [alunoId]);

  const voltarHref = useMemo(
    () =>
      alunoId
        ? `/professor/alunos/${encodeURIComponent(alunoId)}`
        : "/professor/corrida",
    [alunoId]
  );

  async function salvar() {
    if (!alunoId) {
      setErro("Selecione um aluno para atribuir o treino.");
      return;
    }
    setSaving(true);
    setErro(null);
    try {
      const res = await fetch("/api/professor/corrida", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alunoId,
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
      router.push(voltarHref);
    } finally {
      setSaving(false);
    }
  }

  if (!alunoId) {
    return (
      <main className="page-main">
        <div className="page-container page-stack">
          <PageTopBar
            title="Novo treino de corrida"
            onBack={() => router.push("/professor/corrida")}
          />
          <p className="text-muted">
            Abra o perfil do aluno e toque em <strong>Treino de corrida</strong>{" "}
            para montar o treino já vinculado a ele.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Montar corrida"
          subtitle="Passos e intervalos, como na planilha — no celular"
          onBack={() => router.push(voltarHref)}
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
          onCancelar={() => router.push(voltarHref)}
        />
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="page-main">
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <NovoCorridaContent />
    </Suspense>
  );
}
