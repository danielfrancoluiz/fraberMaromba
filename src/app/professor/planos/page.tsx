"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CreditCard } from "lucide-react";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { usePlanos } from "@/hooks/usePlanos";
import { atualizarPlano } from "@/services/professorService";
import { formatarPrecoCentavos, type PlanoOpcao } from "@/lib/planos-pagamento";

function reaisParaCentavos(valor: string): number | null {
  const normalizado = valor.trim().replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(normalizado);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

function centavosParaInput(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

function PlanoEditor({
  plano,
  onSalvo,
}: {
  plano: PlanoOpcao;
  onSalvo: (atualizado: PlanoOpcao) => void;
}) {
  const [nome, setNome] = useState(plano.nome);
  const [preco, setPreco] = useState(centavosParaInput(plano.valorCentavos ?? 0));
  const [dias, setDias] = useState(String(plano.diasValidade ?? 30));
  const [permiteCheckout, setPermiteCheckout] = useState(
    plano.permiteCheckout ?? true
  );
  const [ativo, setAtivo] = useState(plano.ativo ?? true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function salvar() {
    setSaving(true);
    setErro(null);
    setOk(false);

    const valorCentavos = reaisParaCentavos(preco);
    const diasValidade = Number.parseInt(dias, 10);

    if (valorCentavos === null) {
      setErro("Preço inválido");
      setSaving(false);
      return;
    }
    if (Number.isNaN(diasValidade) || diasValidade < 1) {
      setErro("Dias de validade devem ser ≥ 1");
      setSaving(false);
      return;
    }

    try {
      const atualizado = await atualizarPlano(plano.id, {
        nome: nome.trim(),
        valorCentavos,
        diasValidade,
        permiteCheckout,
        ativo,
      });
      onSalvo({
        ...plano,
        ...atualizado,
        preco: atualizado.preco ?? formatarPrecoCentavos(valorCentavos),
      });
      setOk(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card page-stack" style={{ gap: 12 }}>
      <div className="form-section-head" style={{ marginBottom: 0 }}>
        <h2 className="form-section-title" style={{ margin: 0 }}>
          <CreditCard size={18} style={{ display: "inline", marginRight: 8 }} />
          {plano.id}
        </h2>
        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
          {formatarPrecoCentavos(plano.valorCentavos ?? 0)}
        </span>
      </div>

      <div className="form-grid form-grid--2">
        <div>
          <label className="field-label">Nome</label>
          <input
            className="input-field"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Preço (R$)</label>
          <input
            className="input-field"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            inputMode="decimal"
            placeholder="99,90"
          />
        </div>
        <div>
          <label className="field-label">Dias de validade</label>
          <input
            className="input-field"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end" }}>
          <label className="field-label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={permiteCheckout}
              onChange={(e) => setPermiteCheckout(e.target.checked)}
            />
            Cobrar no Stripe
          </label>
          <label className="field-label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            Ativo
          </label>
        </div>
      </div>

      {erro ? <p className="field-error" style={{ margin: 0 }}>{erro}</p> : null}
      {ok ? (
        <p className="text-muted" style={{ margin: 0, color: "var(--fraber-success, #3d9a6a)" }}>
          <Check size={14} style={{ display: "inline", marginRight: 4 }} />
          Salvo — o próximo checkout usará este preço.
        </p>
      ) : null}

      <button
        type="button"
        className="btn-primary btn-compact"
        disabled={saving}
        onClick={() => void salvar()}
      >
        {saving ? "Salvando..." : "Salvar preço"}
      </button>
    </article>
  );
}

export default function Page() {
  const router = useRouter();
  const { planos, loading, erro, setPlanos } = usePlanos({ todos: true });

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Planos e preços"
          subtitle="Valores usados no Stripe Checkout. Altere quando quiser."
          onBack={() => router.push("/professor/perfil")}
        />

        <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          O Stripe cobra o valor salvo aqui no momento do pagamento (sem precisar
          cadastrar produto no Dashboard).{" "}
          <Link href="/professor/perfil">Voltar ao perfil</Link>
        </p>

        {loading ? <p className="text-muted">Carregando planos...</p> : null}
        {erro ? <p className="field-error">{erro}</p> : null}

        {planos.map((plano) => (
          <PlanoEditor
            key={plano.id}
            plano={plano}
            onSalvo={(atualizado) => {
              setPlanos((prev) =>
                prev.map((p) => (p.id === atualizado.id ? { ...p, ...atualizado } : p))
              );
            }}
          />
        ))}
      </div>
    </main>
  );
}
