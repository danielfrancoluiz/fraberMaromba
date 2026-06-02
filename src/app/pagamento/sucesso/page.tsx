"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function Page() {
  return (
    <main
      style={{
        background: "#0D1B2E",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1.5rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <CheckCircle size={64} color="#22c55e" />
      <h1 style={{ margin: 0, color: "#F0F4FF", fontSize: "1.75rem" }}>
        Pagamento Confirmado!
      </h1>
      <p style={{ margin: 0, color: "#7A9CC4", textAlign: "center" }}>
        Seu plano foi ativado com sucesso.
      </p>
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "center",
        }}
      >
        <Link
          href="/aluno/dashboard"
          style={{
            background: "#2E7FD9",
            color: "#F0F4FF",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "1rem",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Ir para o Dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.close()}
          style={{
            background: "#132035",
            color: "#7A9CC4",
            border: "1px solid #1E3050",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Fechar esta aba
        </button>
      </div>
    </main>
  );
}
