"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";

const colors = {
  background: "#0D1B2E",
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

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

  const inputStyle: React.CSSProperties = {
    minHeight: "48px",
    width: "100%",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    padding: "10px 12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.95rem",
    outline: "none",
  };

  return (
    <main
      className="login-page"
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="login-card">
        <h1
          style={{
            margin: 0,
            color: colors.primary,
            fontWeight: 700,
            fontSize: "1.75rem",
            textAlign: "center",
          }}
        >
          FRABER CrossFit
        </h1>
        <p
          style={{
            margin: "8px 0 28px",
            color: colors.textSecondary,
            textAlign: "center",
            fontSize: "0.95rem",
          }}
        >
          Acesse sua conta
        </p>

        {cadastroSucesso ? (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              backgroundColor: colors.surface,
              border: "1px solid #22c55e",
              borderRadius: "10px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors.textPrimary,
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              Conta criada com sucesso! Faça login para continuar.
            </p>
          </div>
        ) : null}

        {authError === "Configuration" ? (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "rgba(232, 0, 28, 0.12)",
              border: "1px solid #E8001C",
              borderRadius: "10px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors.textPrimary,
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              NEXTAUTH_URL: https://fraber-maromba-hyyo.vercel.app — NEXTAUTH_SECRET:
              string aleatória longa (não use o domínio como secret). Redeploy após
              corrigir.
            </p>
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
            <label
              style={{
                display: "block",
                color: colors.textSecondary,
                marginBottom: "6px",
                fontSize: "0.9rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: colors.textSecondary,
                marginBottom: "6px",
                fontSize: "0.9rem",
              }}
            >
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ ...inputStyle, paddingRight: "44px" }}
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
                  color: colors.textSecondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro ? (
            <p style={{ margin: 0, color: colors.secondary, fontSize: "0.9rem" }}>
              {erro}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              minHeight: "48px",
              width: "100%",
              border: "none",
              borderRadius: "10px",
              backgroundColor: colors.primary,
              color: colors.textPrimary,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
          <span style={{ color: colors.textSecondary, fontSize: "0.85rem" }}>ou</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
        </div>

        <button
          type="button"
          disabled={loadingGoogle}
          onClick={() => void handleGoogle()}
          style={{
            minHeight: "48px",
            width: "100%",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            color: colors.background,
            fontFamily: "Inter, sans-serif",
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

        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: "0.9rem" }}>
          <Link
            href="/cadastro"
            style={{ color: colors.primary, textDecoration: "none" }}
          >
            Não tem conta? Cadastre-se
          </Link>
        </p>

        <div
          style={{
            marginTop: "24px",
            padding: "14px 16px",
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            display: "grid",
            gap: "6px",
          }}
        >
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.85rem" }}>
            Professor: ricardo@fraber.com / 123456
          </p>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.85rem" }}>
            Aluno: carlos@fraber.com / 123456
          </p>
        </div>
      </div>

      <style jsx global>{`
        .login-page {
          width: 100%;
          padding: 1.5rem;
        }
        .login-card {
          width: 100%;
        }
        @media (min-width: 768px) {
          .login-card {
            max-width: 420px;
            background-color: #132035;
            border-radius: 12px;
            padding: 2rem;
          }
        }
      `}</style>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            backgroundColor: "#0D1B2E",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7A9CC4",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Carregando...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
