"use client";

interface ResumoAlunosProps {
  total: number;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

export function ResumoAlunos({ total }: ResumoAlunosProps) {
  return (
    <section
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.95rem" }}>Total de Alunos</p>
      <strong
        style={{
          marginTop: "8px",
          display: "inline-block",
          color: colors.primary,
          fontSize: "2rem",
          lineHeight: 1.1,
        }}
      >
        {total}
      </strong>
    </section>
  );
}
