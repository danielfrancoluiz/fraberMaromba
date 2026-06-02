"use client";

import { Aluno } from "@/types";

interface AlunoInfoCardProps {
  aluno: Aluno;
  nomePlano: string;
}

const colors = {
  surface: "#132035",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

function formatarData(valor: string): string {
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) {
    const dataIso = new Date(valor);
    if (Number.isNaN(dataIso.getTime())) return "--/--/----";
    return dataIso.toLocaleDateString("pt-BR");
  }
  return data.toLocaleDateString("pt-BR");
}

function CampoInfo({
  label,
  valor,
  span2 = false,
}: {
  label: string;
  valor: string;
  span2?: boolean;
}) {
  return (
    <div style={{ gridColumn: span2 ? "span 2" : "span 1" }}>
      <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.8rem" }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", color: colors.textPrimary, fontSize: "0.95rem" }}>
        {valor}
      </p>
    </div>
  );
}

export function AlunoInfoCard({ aluno, nomePlano }: AlunoInfoCardProps) {
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "14px 16px",
        }}
      >
        <CampoInfo label="CPF" valor={aluno.cpf} />
        <CampoInfo label="Email" valor={aluno.email} />
        <CampoInfo label="Telefone" valor={aluno.telefone} />
        <CampoInfo label="Sexo" valor={aluno.sexo} />
        <CampoInfo label="Data de Nascimento" valor={formatarData(aluno.dataNascimento)} />
        <CampoInfo label="Peso" valor={`${aluno.peso} kg`} />
        <CampoInfo label="Altura" valor={`${aluno.altura} cm`} />
        <CampoInfo label="Objetivo" valor={aluno.objetivo} span2 />
        <CampoInfo label="Plano" valor={nomePlano} />
        <CampoInfo label="Data de Cadastro" valor={formatarData(aluno.dataCadastro)} />
      </div>
    </section>
  );
}
