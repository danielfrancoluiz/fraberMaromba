"use client";

import { Aluno } from "@/types";

interface AlunoInfoCardProps {
  aluno: Aluno;
  nomePlano: string;
}

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
    <div className={span2 ? "info-field--span2" : undefined}>
      <p className="info-field-label">{label}</p>
      <p className="info-field-value">{valor}</p>
    </div>
  );
}

export function AlunoInfoCard({ aluno, nomePlano }: AlunoInfoCardProps) {
  return (
    <section className="card">
      <div className="info-grid">
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
