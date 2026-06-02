"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useHistoricoCheckins } from "@/hooks/useHistoricoCheckins";

interface HistoricoCheckinsProps {
  alunoId?: string;
}

interface AlunoOption {
  id: string;
  nomeCompleto: string;
}

interface AlunoApi {
  id: string;
  nomeCompleto: string;
}

interface ApiErrorBody {
  error?: string;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

function formatarDataHora(dataHora: string): string {
  const data = new Date(dataHora);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function isAlunoApi(value: unknown): value is AlunoApi {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return typeof dados.id === "string" && typeof dados.nomeCompleto === "string";
}

export function HistoricoCheckins({ alunoId }: HistoricoCheckinsProps) {
  const {
    checkins,
    loading,
    erro,
    filtroAlunoId,
    setFiltroAlunoId,
  } = useHistoricoCheckins(alunoId);

  const [alunos, setAlunos] = useState<AlunoOption[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(!alunoId);

  useEffect(() => {
    if (alunoId) return;

    let ativo = true;

    const carregarAlunos = async (): Promise<void> => {
      setLoadingAlunos(true);

      try {
        const res = await fetch("/api/professor/alunos");
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          throw new Error(
            typeof body === "object" &&
              body !== null &&
              "error" in body &&
              typeof (body as ApiErrorBody).error === "string"
              ? (body as ApiErrorBody).error
              : "Erro ao carregar alunos"
          );
        }

        const dados: unknown = await res.json();
        if (!ativo || !Array.isArray(dados)) return;

        setAlunos(
          dados.filter(isAlunoApi).map((a) => ({
            id: a.id,
            nomeCompleto: a.nomeCompleto,
          }))
        );
      } catch {
        if (ativo) setAlunos([]);
      } finally {
        if (ativo) setLoadingAlunos(false);
      }
    };

    void carregarAlunos();

    return () => {
      ativo = false;
    };
  }, [alunoId]);

  return (
    <section className="historico-checkins">
      <h2
        style={{
          margin: "0 0 1rem",
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <CalendarCheck size={22} color={colors.primary} />
        Histórico de Presenças
      </h2>

      {!alunoId ? (
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              color: colors.textSecondary,
              fontSize: "0.9rem",
              marginBottom: "6px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Filtrar por aluno
          </label>
          <select
            value={filtroAlunoId}
            onChange={(e) => setFiltroAlunoId(e.target.value)}
            disabled={loadingAlunos}
            style={{
              width: "100%",
              minHeight: "48px",
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              padding: "10px 12px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <option value="">Todos os alunos</option>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nomeCompleto}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {loading ? (
        <p style={{ color: colors.textSecondary, fontFamily: "Inter, sans-serif" }}>
          Carregando...
        </p>
      ) : erro ? (
        <p style={{ color: colors.secondary, fontFamily: "Inter, sans-serif" }}>
          {erro}
        </p>
      ) : checkins.length === 0 ? (
        <p style={{ color: colors.textSecondary, fontFamily: "Inter, sans-serif" }}>
          Nenhuma presença registrada ainda.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: "0.75rem",
          }}
        >
          {checkins.map((checkin) => (
            <li
              key={checkin.id}
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "10px",
                padding: "12px 14px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <p style={{ margin: 0, color: colors.textPrimary, fontSize: "0.95rem" }}>
                {formatarDataHora(checkin.dataHora)}
              </p>
              <p style={{ margin: "4px 0 0", color: colors.textSecondary, fontSize: "0.85rem" }}>
                {checkin.aluno.nomeCompleto}
              </p>
            </li>
          ))}
        </ul>
      )}

      <style jsx global>{`
        .historico-checkins {
          width: 100%;
          padding: 1rem;
        }
        @media (min-width: 768px) {
          .historico-checkins {
            max-width: 600px;
            margin: 0 auto;
          }
        }
        @media (min-width: 1024px) {
          .historico-checkins {
            max-width: 800px;
          }
        }
      `}</style>
    </section>
  );
}
