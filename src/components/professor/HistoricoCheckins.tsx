"use client";

import { useEffect, useState } from "react";
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
    <div className="page-stack">
      {!alunoId ? (
        <div>
          <label className="field-label" htmlFor="filtro-aluno-checkin">
            Filtrar por aluno
          </label>
          <select
            id="filtro-aluno-checkin"
            className="input-field"
            value={filtroAlunoId}
            onChange={(e) => setFiltroAlunoId(e.target.value)}
            disabled={loadingAlunos}
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
        <p className="text-muted">Carregando...</p>
      ) : erro ? (
        <p className="text-accent">{erro}</p>
      ) : checkins.length === 0 ? (
        <p className="text-muted">Nenhuma presença registrada ainda.</p>
      ) : (
        <ul className="checkin-list">
          {checkins.map((checkin) => (
            <li key={checkin.id} className="checkin-list-item">
              <p className="checkin-list-date">{formatarDataHora(checkin.dataHora)}</p>
              <p className="checkin-list-aluno">{checkin.aluno.nomeCompleto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
