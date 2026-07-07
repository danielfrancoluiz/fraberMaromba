"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function EsqueciSenhaContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        mensagem?: string;
      } | null;

      if (!res.ok) {
        setErro(data?.error ?? "Não foi possível processar o pedido");
        return;
      }

      setMensagem(
        data?.mensagem ??
          "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha."
      );
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo-wrap">
          <Logo size={96} showText />
        </div>

        <p className="auth-subtitle">Esqueci minha senha</p>
        <p className="text-muted" style={{ margin: "0 0 1rem", fontSize: "0.875rem" }}>
          Informe seu e-mail. Enviaremos um link para criar uma nova senha.
        </p>

        <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <label className="field-label" htmlFor="esqueci-email">
              E-mail
            </label>
            <input
              id="esqueci-email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {erro ? <p className="field-error">{erro}</p> : null}
          {mensagem ? (
            <p className="auth-alert auth-alert--success" style={{ margin: 0 }}>
              {mensagem}
            </p>
          ) : null}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>

        <p className="auth-footer">
          <Link href="/login">Voltar ao login</Link>
        </p>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <Logo size={80} />
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <EsqueciSenhaContent />
    </Suspense>
  );
}
