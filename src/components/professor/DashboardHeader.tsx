"use client";

interface DashboardHeaderProps {
  nome: string;
}

const colors = {
  background: "#0D1B2E",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
};

function getIniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3);
}

export function DashboardHeader({ nome }: DashboardHeaderProps) {
  return (
    <header
      style={{
        backgroundColor: colors.background,
        color: colors.textPrimary,
        fontFamily: "Inter, sans-serif",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "9999px",
          backgroundColor: colors.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "1rem",
        }}
      >
        {getIniciais(nome)}
      </div>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{nome}</h1>
        <p style={{ margin: "4px 0 0", color: colors.textSecondary, fontSize: "0.95rem" }}>
          Painel do Professor
        </p>
      </div>
    </header>
  );
}
