"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { Logo } from "@/components/Logo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { GoogleRolePicker } from "@/components/GoogleRolePicker";

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
    googleRole,
    setEmail,
    setSenha,
    setGoogleRole,
    handleLogin,
    handleGoogle,
  } = useLogin();

  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo-wrap">
          <Logo size={112} showText />
        </div>

        <p className="auth-subtitle">Acesse sua conta</p>

        {cadastroSucesso ? (
          <div className="auth-alert auth-alert--success">
            Conta criada com sucesso! Faça login para continuar.
          </div>
        ) : null}

        {authError === "Configuration" ? (
          <div className="auth-alert auth-alert--error">
            Erro de configuração do login. Verifique NEXTAUTH_URL e NEXTAUTH_SECRET.
          </div>
        ) : null}

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
        >
          <div>
            <label className="field-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="login-senha">
              Senha
            </label>
            <div className="input-wrap-icon">
              <input
                id="login-senha"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                autoComplete="current-password"
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

          <p className="auth-forgot-wrap">
            <Link href="/esqueci-senha">Esqueci minha senha</Link>
          </p>

          {erro ? <p className="field-error">{erro}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <GoogleRolePicker value={googleRole} onChange={setGoogleRole} />

        <button
          type="button"
          className="btn-google"
          disabled={loadingGoogle}
          onClick={() => void handleGoogle()}
          style={{ marginTop: 12 }}
        >
          <GoogleIcon />
          {loadingGoogle ? "Aguardando Google..." : "Entrar com Google"}
        </button>

        {googleRole === "aluno" ? (
          <p className="text-muted" style={{ margin: "8px 0 0", fontSize: "0.85rem", textAlign: "center" }}>
            Conta nova de aluno: use o link de convite do professor (não o
            cadastro aberto). Quem já tem conta pode entrar normalmente.
          </p>
        ) : null}

        <p className="auth-footer">
          <Link href="/cadastro">Sou professor? Criar conta</Link>
        </p>
        <p
          className="text-muted"
          style={{ textAlign: "center", margin: "4px 0 0", fontSize: "0.85rem" }}
        >
          Aluno: cadastro só pelo link de convite.
        </p>

        <div className="chart-empty auth-demo-hint">
          <p>Professor: ricardo@fraber.com / 123456</p>
          <p>Aluno: carlos@fraber.com / 123456</p>
        </div>
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
      <LoginContent />
    </Suspense>
  );
}
