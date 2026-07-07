"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          novaSenha,
          confirmarSenha,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        mensagem?: string;
      } | null;

      if (!res.ok) {
        setErro(data?.error ?? "Não foi possível redefinir a senha");
        return;
      }

      setSucesso(data?.mensagem ?? "Senha redefinida com sucesso!");
      setTimeout(() => router.push("/login"), 1500);
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
          Informe seu e-mail e escolha uma nova senha.
        </p>

        <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <label className="field-label" htmlFor="esqueci-email">
              E-mail da conta
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

          <div>
            <label className="field-label" htmlFor="esqueci-nova-senha">
              Nova senha
            </label>
            <div className="input-wrap-icon">
              <input
                id="esqueci-nova-senha"
                type={mostrarSenha ? "text" : "password"}
                className="input-field"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="esqueci-confirmar-senha">
              Confirmar nova senha
            </label>
            <input
              id="esqueci-confirmar-senha"
              type="password"
              className="input-field"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {erro ? <p className="field-error">{erro}</p> : null}
          {sucesso ? (
            <p className="auth-alert auth-alert--success" style={{ margin: 0 }}>
              {sucesso}
            </p>
          ) : null}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>

        <p className="auth-footer">
          <Link href="/login">Voltar ao login</Link>
        </p>
      </div>
    </main>
  );
}
