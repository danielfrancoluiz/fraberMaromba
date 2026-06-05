"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { CadastroAlunoForm as CadastroAlunoFormType } from "@/types";
import { useCadastroAluno } from "@/hooks/useCadastroAluno";
import { PageTopBar } from "@/components/ui/PageTopBar";

interface CampoProps {
  nome: keyof CadastroAlunoFormType;
  label: string;
  children: React.ReactNode;
  erro?: string;
  className?: string;
}

function Campo({ label, children, erro, className }: CampoProps) {
  return (
    <div className={className}>
      <label className="field-label">{label}</label>
      {children}
      {erro ? <p className="field-error">{erro}</p> : null}
    </div>
  );
}

export function CadastroAlunoForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    form,
    errors,
    planos,
    loadingPlanos,
    loadingSubmit,
    feedbackSucesso,
    feedbackErro,
    handleChange,
    handleSubmit,
  } = useCadastroAluno();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "professor") {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <main className="page-main">
        <p className="loading-center text-muted">Carregando...</p>
      </main>
    );
  }

  if (!session || session.user.role !== "professor") {
    return null;
  }

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Novo aluno"
          subtitle="Cadastre um novo aluno"
          onBack={() => router.push("/professor/dashboard")}
        />

        <form
          className="form-grid form-grid--2 card"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <Campo nome="nomeCompleto" label="Nome completo" erro={errors.nomeCompleto} className="field-span2">
            <input
              className="input-field"
              value={form.nomeCompleto}
              onChange={(e) => handleChange("nomeCompleto", e.target.value)}
            />
          </Campo>

          <Campo nome="cpf" label="CPF" erro={errors.cpf}>
            <input
              className="input-field"
              value={form.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
            />
          </Campo>

          <Campo nome="email" label="Email" erro={errors.email}>
            <input
              className="input-field"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </Campo>

          <Campo nome="telefone" label="Telefone" erro={errors.telefone}>
            <input
              className="input-field"
              value={form.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
            />
          </Campo>

          <Campo nome="sexo" label="Sexo" erro={errors.sexo}>
            <select
              className="input-field"
              value={form.sexo}
              onChange={(e) => handleChange("sexo", e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </Campo>

          <Campo nome="dataNascimento" label="Data de nascimento" erro={errors.dataNascimento}>
            <input
              type="date"
              className="input-field"
              value={form.dataNascimento}
              onChange={(e) => handleChange("dataNascimento", e.target.value)}
            />
          </Campo>

          <Campo nome="peso" label="Peso (kg)" erro={errors.peso}>
            <input
              className="input-field"
              value={form.peso}
              onChange={(e) => handleChange("peso", e.target.value)}
            />
          </Campo>

          <Campo nome="altura" label="Altura (cm)" erro={errors.altura}>
            <input
              className="input-field"
              value={form.altura}
              onChange={(e) => handleChange("altura", e.target.value)}
            />
          </Campo>

          <Campo nome="objetivo" label="Objetivo" erro={errors.objetivo} className="field-span2">
            <textarea
              rows={3}
              className="input-field textarea-field"
              value={form.objetivo}
              onChange={(e) => handleChange("objetivo", e.target.value)}
            />
          </Campo>

          <Campo nome="planoId" label="Plano" erro={errors.planoId}>
            <select
              className="input-field"
              value={form.planoId}
              onChange={(e) => handleChange("planoId", e.target.value)}
            >
              <option value="">
                {loadingPlanos ? "Carregando planos..." : "Selecione um plano"}
              </option>
              {!loadingPlanos &&
                planos.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome}
                  </option>
                ))}
            </select>
          </Campo>

          {feedbackSucesso ? (
            <p className="field-full auth-alert auth-alert--success">{feedbackSucesso}</p>
          ) : null}
          {feedbackErro ? (
            <p className="field-full auth-alert auth-alert--error">{feedbackErro}</p>
          ) : null}

          <button type="submit" disabled={loadingSubmit} className="btn-primary field-submit">
            {loadingSubmit ? "Salvando..." : "Salvar aluno"}
          </button>
        </form>
      </div>
    </main>
  );
}
