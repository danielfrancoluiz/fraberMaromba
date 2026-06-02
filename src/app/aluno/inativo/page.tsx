"use client";

import { LockKeyhole } from "lucide-react";
import { signOut } from "next-auth/react";

const colors = {
  background: "#0D1B2E",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

export default function Page() {
  return (
    <main
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "480px",
          display: "grid",
          gap: "16px",
          justifyItems: "center",
        }}
      >
        <LockKeyhole size={64} color={colors.secondary} />

        <h1 style={{ margin: 0, color: colors.textPrimary, fontSize: "1.75rem" }}>
          Conta Inativa
        </h1>

        <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.6 }}>
          Sua conta está inativa. Para acessar seus treinos você precisa estar
          vinculado a um professor ou assinar um plano da plataforma.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            marginTop: "8px",
          }}
        >
          <a
            href="mailto:contato@fraber.com"
            style={{
              minHeight: "48px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: colors.primary,
              color: colors.textPrimary,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            Falar com Suporte
          </a>

          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            style={{
              minHeight: "48px",
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              backgroundColor: "transparent",
              color: colors.textSecondary,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </main>
  );
}
