"use client";

import { ArrowLeft, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";

const colors = {
  background: "#0D1B2E",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

export default function Page() {
  const router = useRouter();

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
          maxWidth: "420px",
          display: "grid",
          gap: "16px",
          justifyItems: "center",
        }}
      >
        <ShieldOff size={64} color={colors.secondary} />

        <h1 style={{ margin: 0, color: colors.textPrimary, fontSize: "1.75rem" }}>
          Acesso Negado
        </h1>

        <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.5 }}>
          Você não tem permissão para acessar esta página.
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
          <button
            type="button"
            onClick={() => router.back()}
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
              gap: "8px",
            }}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
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
            Ir para o Login
          </button>
        </div>
      </div>
    </main>
  );
}
