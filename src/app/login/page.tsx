"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { Logo } from "@/components/Logo";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const cadastroSucesso = searchParams.get("cadastro") === "sucesso";
  const authError = searchParams.get("error");

  const {
    email,
    senha,
    loading,
    loadingGoogle,
    erro,
    setEmail,
    setSenha,
    handleLogin,
    handleGoogle,
  } = useLogin();

  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <main
      className="login-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div className="login-card card" style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          <Logo size={112} showText />
        </div>

        <p className="text-muted" style={{ margin: "0 0 1.5rem", textAlign: "center" }}>
          Acesse sua conta
        </p>

        {cadastroSucesso ? (
          <div
            className="card"
            style={{
              marginBottom: "1rem",
              borderColor: "var(--fraber-success)",
              background: "rgba(34, 197, 94, 0.08)",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem", textAlign: "center" }}>
              Conta criada com sucesso! Faça login para continuar.
            </p>
          </div>
        ) : null}

        {authError === "Configuration" ? (
          <div
            style={{
              marginBottom: "1rem",
              padding: "12px",
              borderRadius: "var(--fraber-radius-sm)",
              background: "rgba(232, 0, 28, 0.1)",
              border: "1px solid var(--fraber-accent)",
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            Erro de configuração do login. Verifique NEXTAUTH_URL e NEXTAUTH_SECRET na
            Vercel.
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
          style={{ display: "grid", gap: "14px" }}
        >
          <div>
            <label className="text-muted" style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-muted" style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                style={{ paddingRight: "44px" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "var(--fraber-text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                }}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro ? (
            <p className="text-accent" style={{ margin: 0, fontSize: "0.9rem" }}>
              {erro}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%" }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "1.25rem 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--fraber-border)" }} />
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "var(--fraber-border)" }} />
        </div>

        <button
          type="button"
          disabled={loadingGoogle}
          onClick={() => void handleGoogle()}
          style={{
            minHeight: "48px",
            width: "100%",
            border: "1px solid var(--fraber-border)",
            borderRadius: "var(--fraber-radius-sm)",
            background: "#fff",
            color: "#111",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: loadingGoogle ? "not-allowed" : "pointer",
            opacity: loadingGoogle ? 0.75 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <GoogleIcon />
          {loadingGoogle ? "Aguardando Google..." : "Entrar com Google"}
        </button>

        <p style={{ margin: "1.5rem 0 0", textAlign: "center", fontSize: "0.9rem" }}>
          <Link href="/cadastro" style={{ color: "var(--fraber-primary)", textDecoration: "none" }}>
            Não tem conta? Cadastre-se
          </Link>
        </p>

        <div
          className="chart-empty"
          style={{ marginTop: "1.25rem", fontSize: "0.8rem", textAlign: "left" }}
        >
          <p style={{ margin: 0 }}>Professor: ricardo@fraber.com / 123456</p>
          <p style={{ margin: "6px 0 0" }}>Aluno: carlos@fraber.com / 123456</p>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main
          className="page-main"
          style={{ display: "grid", placeItems: "center" }}
        >
          <Logo size={80} />
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
