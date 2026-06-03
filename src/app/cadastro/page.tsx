"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserCheck } from "lucide-react";
import { useCadastro } from "@/hooks/useCadastro";
import { Logo } from "@/components/Logo";

const colors = {
  background: "#0D1B2E",
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

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
      className="cadastro-page page-main"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="cadastro-card card" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <Logo size={88} />
        </div>
        <h1
          style={{
            margin: "0 0 24px",
            fontWeight: 700,
            fontSize: "1.35rem",
            textAlign: "center",
          }}
        >
          Criar Conta
        </h1>

        {loadingConvite ? (
          <p
            style={{
              margin: "0 0 20px",
              color: colors.textSecondary,
              textAlign: "center",
              fontSize: "0.9rem",
            }}
          >
            Validando convite...
          </p>
        ) : null}

        {convite && !feedbackErro ? (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.primary}`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <UserCheck
              size={20}
              color={colors.primary}
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <p
              style={{
                margin: 0,
                color: colors.textSecondary,
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              Você foi convidado por um professor. Sua conta será vinculada
              automaticamente.
            </p>
          </div>
        ) : null}

        {feedbackErro ? (
          <p
            style={{
              margin: "0 0 20px",
              color: colors.secondary,
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            {feedbackErro}
          </p>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
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
              Nome Completo
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              style={inputStyle}
              disabled={formularioDesabilitado}
              autoComplete="name"
            />
            {errors.nome ? (
              <p style={{ margin: "6px 0 0", color: colors.secondary, fontSize: "0.85rem" }}>
                {errors.nome}
              </p>
            ) : null}
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
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={{
                ...inputStyle,
                opacity: emailReadonly ? 0.7 : 1,
                cursor: emailReadonly ? "not-allowed" : "text",
              }}
              readOnly={emailReadonly}
              disabled={formularioDesabilitado}
              autoComplete="email"
            />
            {errors.email ? (
              <p style={{ margin: "6px 0 0", color: colors.secondary, fontSize: "0.85rem" }}>
                {errors.email}
              </p>
            ) : null}
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
            <input
              type="password"
              value={form.senha}
              onChange={(e) => handleChange("senha", e.target.value)}
              style={inputStyle}
              disabled={formularioDesabilitado}
              autoComplete="new-password"
            />
            {errors.senha ? (
              <p style={{ margin: "6px 0 0", color: colors.secondary, fontSize: "0.85rem" }}>
                {errors.senha}
              </p>
            ) : null}
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
              Confirmar Senha
            </label>
            <input
              type="password"
              value={form.confirmarSenha}
              onChange={(e) => handleChange("confirmarSenha", e.target.value)}
              style={inputStyle}
              disabled={formularioDesabilitado}
              autoComplete="new-password"
            />
            {errors.confirmarSenha ? (
              <p style={{ margin: "6px 0 0", color: colors.secondary, fontSize: "0.85rem" }}>
                {errors.confirmarSenha}
              </p>
            ) : null}
          </div>

          {errors.geral ? (
            <p style={{ margin: 0, color: colors.secondary, fontSize: "0.9rem" }}>
              {errors.geral}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={formularioDesabilitado || loadingSubmit}
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
              cursor: formularioDesabilitado || loadingSubmit ? "not-allowed" : "pointer",
              opacity: formularioDesabilitado || loadingSubmit ? 0.75 : 1,
            }}
          >
            {loadingSubmit ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>

        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: "0.9rem" }}>
          <Link href="/login" style={{ color: colors.primary, textDecoration: "none" }}>
            Já tem conta? Faça login
          </Link>
        </p>
      </div>

      <style jsx global>{`
        .cadastro-page {
          width: 100%;
          padding: 1.5rem;
        }
        .cadastro-card {
          width: 100%;
        }
        @media (min-width: 768px) {
          .cadastro-card {
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
      <CadastroContent />
    </Suspense>
  );
}
