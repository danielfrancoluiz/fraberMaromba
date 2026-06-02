"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { CadastroAlunoForm as CadastroAlunoFormType } from "@/types";
import { useCadastroAluno } from "@/hooks/useCadastroAluno";

const colors = {
  background: "#0D1B2E",
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

const inputBaseStyle: React.CSSProperties = {
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

const labelStyle: React.CSSProperties = {
  color: colors.textSecondary,
  marginBottom: "6px",
  fontSize: "0.92rem",
  fontFamily: "Inter, sans-serif",
  display: "block",
};

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
      <label style={labelStyle}>{label}</label>
      {children}
      {erro ? (
        <p style={{ margin: "6px 0 0", color: colors.secondary, fontSize: "0.85rem", fontFamily: "Inter, sans-serif" }}>
          {erro}
        </p>
      ) : null}
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
      <main
        style={{
          backgroundColor: colors.background,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: colors.textSecondary,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Carregando...
      </main>
    );
  }

  if (!session || session.user.role !== "professor") {
    return null;
  }

  return (
    <section
      className="cadastro-aluno-section"
      style={{
        backgroundColor: colors.background,
        color: colors.textPrimary,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="cadastro-aluno-container">
        <header className="cadastro-aluno-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => router.push("/professor/dashboard")}
            style={{
              minHeight: "40px",
              minWidth: "40px",
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Novo Aluno</h1>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="cadastro-aluno-form-grid"
          style={{ display: "grid", gap: "14px" }}
        >
          <Campo nome="nomeCompleto" label="Nome Completo" erro={errors.nomeCompleto} className="field-nome">
            <input
              value={form.nomeCompleto}
              onChange={(e) => handleChange("nomeCompleto", e.target.value)}
              style={inputBaseStyle}
            />
          </Campo>

          <Campo nome="cpf" label="CPF" erro={errors.cpf} className="field-cpf">
            <input value={form.cpf} onChange={(e) => handleChange("cpf", e.target.value)} style={inputBaseStyle} />
          </Campo>

          <Campo nome="email" label="Email" erro={errors.email} className="field-email">
            <input value={form.email} onChange={(e) => handleChange("email", e.target.value)} style={inputBaseStyle} />
          </Campo>

          <Campo nome="telefone" label="Telefone" erro={errors.telefone} className="field-telefone">
            <input
              value={form.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              style={inputBaseStyle}
            />
          </Campo>

          <Campo nome="sexo" label="Sexo" erro={errors.sexo} className="field-sexo">
            <select value={form.sexo} onChange={(e) => handleChange("sexo", e.target.value)} style={inputBaseStyle}>
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </Campo>

          <Campo nome="dataNascimento" label="Data de Nascimento" erro={errors.dataNascimento} className="field-data">
            <input
              type="date"
              value={form.dataNascimento}
              onChange={(e) => handleChange("dataNascimento", e.target.value)}
              style={inputBaseStyle}
            />
          </Campo>

          <Campo nome="peso" label="Peso (kg)" erro={errors.peso} className="field-peso">
            <input value={form.peso} onChange={(e) => handleChange("peso", e.target.value)} style={inputBaseStyle} />
          </Campo>

          <Campo nome="altura" label="Altura (cm)" erro={errors.altura} className="field-altura">
            <input
              value={form.altura}
              onChange={(e) => handleChange("altura", e.target.value)}
              style={inputBaseStyle}
            />
          </Campo>

          <Campo nome="objetivo" label="Objetivo" erro={errors.objetivo} className="field-objetivo">
            <textarea
              rows={3}
              value={form.objetivo}
              onChange={(e) => handleChange("objetivo", e.target.value)}
              style={{ ...inputBaseStyle, minHeight: "96px", resize: "vertical" }}
            />
          </Campo>

          <Campo nome="planoId" label="Plano" erro={errors.planoId} className="field-plano">
            <select value={form.planoId} onChange={(e) => handleChange("planoId", e.target.value)} style={inputBaseStyle}>
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
            <p className="field-full" style={{ margin: 0, color: colors.primary, fontSize: "0.92rem" }}>
              Aluno cadastrado com sucesso!
            </p>
          ) : null}
          {feedbackErro ? (
            <p className="field-full" style={{ margin: 0, color: colors.secondary, fontSize: "0.92rem" }}>
              {feedbackErro}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loadingSubmit}
            className="field-submit"
            style={{
              minHeight: "48px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: colors.primary,
              color: colors.textPrimary,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              cursor: loadingSubmit ? "not-allowed" : "pointer",
              opacity: loadingSubmit ? 0.75 : 1,
            }}
          >
            {loadingSubmit ? "Salvando..." : "Salvar Aluno"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .cadastro-aluno-section {
          width: 100%;
          padding: 1rem;
        }

        .cadastro-aluno-container {
          width: 100%;
        }

        .cadastro-aluno-header {
          position: sticky;
          top: 0;
          z-index: 20;
          width: 100%;
          background: ${colors.background};
          padding: 0.5rem 0;
        }

        .cadastro-aluno-form-grid {
          width: 100%;
          grid-template-columns: 1fr;
        }

        .field-full,
        .field-submit {
          width: 100%;
        }

        @media (min-width: 768px) {
          .cadastro-aluno-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .cadastro-aluno-section {
            padding: 1.5rem 2rem;
          }
        }

        @media (min-width: 1024px) {
          .cadastro-aluno-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .cadastro-aluno-section {
            padding: 2rem 3rem;
          }

          .cadastro-aluno-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 1rem;
            row-gap: 14px;
          }

          .field-nome,
          .field-objetivo,
          .field-full,
          .field-submit {
            grid-column: span 2;
          }
        }
      `}</style>
    </section>
  );
}
