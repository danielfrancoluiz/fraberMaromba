"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserCheck } from "lucide-react";
import { useCadastro } from "@/hooks/useCadastro";
import { Logo } from "@/components/Logo";

function CadastroContent() {
  const searchParams = useSearchParams();
  const tokenConvite = searchParams.get("convite") ?? undefined;

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

  const formularioDesabilitado =
    loadingConvite ||
    (!!tokenConvite && !!feedbackErro) ||
    (!!tokenConvite && !convite && !loadingConvite);

  const emailReadonly = !!convite?.email;

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo-wrap">
          <Logo size={88} />
        </div>
        <h1 className="page-header-title" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Criar conta
        </h1>

        {loadingConvite ? (
          <p className="text-muted" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            Validando convite...
          </p>
        ) : null}

        {convite && !feedbackErro ? (
          <div className="auth-invite-banner">
            <UserCheck size={20} />
            <p>
              Você foi convidado por um professor. Sua conta será vinculada
              automaticamente.
            </p>
          </div>
        ) : null}

        {feedbackErro ? (
          <div className="auth-alert auth-alert--error" style={{ marginBottom: "1.25rem" }}>
            {feedbackErro}
          </div>
        ) : null}

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
            {loadingSubmit ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-footer">
          <Link href="/login">Já tem conta? Faça login</Link>
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
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <CadastroContent />
    </Suspense>
  );
}
