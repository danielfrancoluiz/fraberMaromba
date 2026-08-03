"use client";

import Image from "next/image";
import Link from "next/link";

const VARS = {
  "--p-bg": "#0d0d0d",
  "--p-bg-soft": "#121212",
  "--p-surface": "#181818",
  "--p-surface-2": "#1f1f1f",
  "--p-border": "#2c2c2c",
  "--p-text": "#f0f0f0",
  "--p-muted": "#888888",
  "--p-red": "#c62828",
  "--p-red-soft": "rgba(198, 40, 40, 0.12)",
  "--p-blue": "#2f5aa8",
  "--p-blue-soft": "rgba(47, 90, 168, 0.12)",
  "--p-radius": "10px",
  "--p-shadow": "0 10px 32px rgba(0,0,0,0.4)",
} as const;

const ALUNOS = [
  { nome: "Ana Silva", plano: "Performance", status: "Ativo" },
  { nome: "Bruno Costa", plano: "Base", status: "Ativo" },
  { nome: "Carla Mendes", plano: "Elite", status: "Pendente" },
  { nome: "Diego Rocha", plano: "Performance", status: "Ativo" },
];

/** Referência visual do tema Soft Pro (D) — já aplicado no sistema. */
export default function DesignPreviewPage() {
  return (
    <div
      style={{
        ...VARS,
        minHeight: "100vh",
        background: "var(--p-bg)",
        color: "var(--p-text)",
        fontFamily:
          "var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--p-border)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/logo.png"
            alt="Fraber 360"
            width={36}
            height={36}
            style={{ borderRadius: "22%", objectFit: "cover" }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Soft Pro (D) — aplicado</div>
            <div style={{ fontSize: 12, color: "var(--p-muted)" }}>
              Referência do tema agora em todo o app
            </div>
          </div>
        </div>
        <Link
          href="/login"
          style={{
            color: "var(--p-blue)",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Ir para o app →
        </Link>
      </header>

      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "28px 20px 64px",
          display: "grid",
          gap: 28,
          gridTemplateColumns: "1fr",
        }}
      >
        <section>
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Professor</h2>
          <div
            style={{
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              overflow: "hidden",
              boxShadow: "var(--p-shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 18px",
                borderBottom: "1px solid var(--p-border)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Alunos</div>
                <div style={{ fontSize: 12, color: "var(--p-muted)" }}>4 ativos</div>
              </div>
              <span
                style={{
                  background: "var(--p-red)",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 650,
                }}
              >
                Novo aluno
              </span>
            </div>
            {ALUNOS.map((a, i) => (
              <div
                key={a.nome}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderTop: i === 0 ? "none" : "1px solid var(--p-border)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--p-blue-soft)",
                    color: "var(--p-blue)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {a.nome[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.nome}</div>
                  <div style={{ fontSize: 12, color: "var(--p-muted)" }}>{a.plano}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 650,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background:
                      a.status === "Ativo" ? "var(--p-blue-soft)" : "var(--p-red-soft)",
                    color: a.status === "Ativo" ? "var(--p-blue)" : "var(--p-red)",
                  }}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Aluno — treino</h2>
          <div
            style={{
              maxWidth: 380,
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              padding: 20,
              boxShadow: "var(--p-shadow)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--p-blue)", fontWeight: 650 }}>
              EXERCÍCIO 2 DE 6
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>Supino reto</div>
            <div
              style={{
                marginTop: 16,
                textAlign: "center",
                padding: 14,
                background: "var(--p-bg-soft)",
                borderRadius: 8,
                border: "1px solid var(--p-border)",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--p-muted)" }}>DESCANSO</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--p-red)" }}>01:12</div>
            </div>
            <button
              type="button"
              style={{
                marginTop: 12,
                width: "100%",
                background: "var(--p-red)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Concluir série
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
