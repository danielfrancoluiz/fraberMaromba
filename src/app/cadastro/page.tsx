"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserCheck } from "lucide-react";
import { useCadastro } from "@/hooks/useCadastro";
import { useLogin } from "@/hooks/useLogin";
import { Logo } from "@/components/Logo";
import { GoogleIcon } from "@/components/GoogleIcon";

function CadastroContent() {
  const searchParams = useSearchParams();
  const tokenConvite = searchParams.get("convite") ?? undefined;
  const erroUrl = searchParams.get("erro");
  const temConvite = Boolean(tokenConvite);

  const {
    form,
    errors,
    convite,
    loadingConvite,
    loadingSubmit,
    feedbackErro,
    handleChange,
    handleSubmit,
  } = useCadastro(tokenConvite);

  const {
    loadingGoogle,
    handleGoogle,
    erro: erroGoogle,
  } = useLogin(temConvite ? "aluno" : "professor");

  const [googleErro, setGoogleErro] = useState<string | null>(null);

  const formularioDesabilitado =
    loadingConvite ||
    (!!tokenConvite && !!feedbackErro) ||
    (!!tokenConvite && !convite && !loadingConvite);

  const emailReadonly = !!convite?.email;

  const mensagemErroUrl =
    erroUrl === "convite"
      ? "Para criar conta de aluno, use o link de convite do seu professor."
      : erroUrl === "convite-invalido"
        ? "Convite inválido ou já utilizado."
        : null;

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo-wrap">
          <Logo size={88} />
        </div>
        <h1
          className="page-header-title"
          style={{ textAlign: "center", marginBottom: "0.5rem" }}
        >
          {temConvite ? "Criar conta de aluno" : "Criar conta de professor"}
        </h1>
        <p
          className="text-muted"
          style={{ textAlign: "center", margin: "0 0 1.5rem", fontSize: "0.9rem" }}
        >
          {temConvite
            ? "Você foi convidado. Complete o cadastro para acessar a plataforma."
            : "Cadastro aberto só para professores. Alunos entram pelo link de convite."}
        </p>

        {loadingConvite ? (
          <p className="text-muted" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            Validando convite...
          </p>
        ) : null}

        {convite && !feedbackErro ? (
          <div className="auth-invite-banner">
            <UserCheck size={20} />
            <p>
              Convite válido. Sua conta de aluno será vinculada ao professor
              automaticamente.
            </p>
          </div>
        ) : null}

        {feedbackErro ? (
          <div className="auth-alert auth-alert--error" style={{ marginBottom: "1.25rem" }}>
            {feedbackErro}
          </div>
        ) : null}

        {mensagemErroUrl ? (
          <div className="auth-alert auth-alert--error" style={{ marginBottom: "1.25rem" }}>
            {mensagemErroUrl}
          </div>
        ) : null}

        <button
          type="button"
          className="btn-google"
          disabled={formularioDesabilitado || loadingGoogle}
          onClick={() => {
            setGoogleErro(null);
            void handleGoogle(tokenConvite).catch(() => {
              setGoogleErro("Não foi possível continuar com Google.");
            });
          }}
        >
          <GoogleIcon />
          {loadingGoogle ? "Aguardando Google..." : "Continuar com Google"}
        </button>

        {erroGoogle || googleErro ? (
          <p className="field-error" style={{ marginTop: "0.75rem" }}>
            {erroGoogle ?? googleErro}
          </p>
        ) : null}

        <div className="auth-divider">ou</div>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div>
            <label className="field-label" htmlFor="cadastro-nome">
              Nome completo
            </label>
            <input
              id="cadastro-nome"
              type="text"
              className="input-field"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              disabled={formularioDesabilitado}
              autoComplete="name"
            />
            {errors.nome ? <p className="field-error">{errors.nome}</p> : null}
          </div>

          <div>
            <label className="field-label" htmlFor="cadastro-email">
              Email
            </label>
            <input
              id="cadastro-email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              readOnly={emailReadonly}
              disabled={formularioDesabilitado}
              autoComplete="email"
              style={emailReadonly ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
            />
            {errors.email ? <p className="field-error">{errors.email}</p> : null}
          </div>

          <div>
            <label className="field-label" htmlFor="cadastro-senha">
              Senha
            </label>
            <input
              id="cadastro-senha"
              type="password"
              className="input-field"
              value={form.senha}
              onChange={(e) => handleChange("senha", e.target.value)}
              disabled={formularioDesabilitado}
              autoComplete="new-password"
            />
            {errors.senha ? <p className="field-error">{errors.senha}</p> : null}
          </div>

          <div>
            <label className="field-label" htmlFor="cadastro-confirmar">
              Confirmar senha
            </label>
            <input
              id="cadastro-confirmar"
              type="password"
              className="input-field"
              value={form.confirmarSenha}
              onChange={(e) => handleChange("confirmarSenha", e.target.value)}
              disabled={formularioDesabilitado}
              autoComplete="new-password"
            />
            {errors.confirmarSenha ? (
              <p className="field-error">{errors.confirmarSenha}</p>
            ) : null}
          </div>

          {errors.geral ? <p className="field-error">{errors.geral}</p> : null}

          <button
            type="submit"
            className="btn-primary"
            disabled={formularioDesabilitado || loadingSubmit}
          >
            {loadingSubmit
              ? "Criando conta..."
              : temConvite
                ? "Criar conta de aluno"
                : "Criar conta de professor"}
          </button>
        </form>

        <p className="auth-footer">
          <Link href="/login">Já tem conta? Faça login</Link>
        </p>
        {!temConvite ? (
          <p
            className="text-muted"
            style={{ textAlign: "center", margin: "8px 0 0", fontSize: "0.85rem" }}
          >
            É aluno? Peça o link de convite ao seu professor.
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <CadastroContent />
    </Suspense>
  );
}
