"use client";

import { useLoginAluno } from "@/hooks/useLoginAluno";

const colors = {
  background: "#0D1B2E",
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

export default function Page() {
  const { email, senha, erro, loading, setEmail, setSenha, handleLogin } =
    useLoginAluno();

  const inputStyle: React.CSSProperties = {
    minHeight: "48px",
    width: "100%",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    padding: "10px 12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.95rem",
  };

  return (
    <main
      className="aluno-page"
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="aluno-page-container">
        <h1 style={{ margin: 0, color: colors.textPrimary, fontSize: "1.5rem" }}>
          Área do Aluno
        </h1>
        <p style={{ margin: "8px 0 24px", color: colors.textSecondary }}>
          Entre com seu email e senha
        </p>

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
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
            />
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
              border: "none",
              borderRadius: "10px",
              backgroundColor: colors.primary,
              color: colors.textPrimary,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            color: colors.textSecondary,
            fontSize: "0.85rem",
          }}
        >
          Demo: carlos@fraber.com / 123456
        </p>
      </div>

      <style jsx global>{`
        .aluno-page {
          width: 100%;
          padding: 1rem;
        }
        .aluno-page-container {
          width: 100%;
        }
        @media (min-width: 768px) {
          .aluno-page-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .aluno-page {
            padding: 1.5rem 2rem;
          }
        }
        @media (min-width: 1024px) {
          .aluno-page-container {
            max-width: 800px;
          }
          .aluno-page {
            padding: 2rem 3rem;
          }
        }
      `}</style>
    </main>
  );
}
