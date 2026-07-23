"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, User } from "lucide-react";
import { Aluno } from "@/types";
import { alunoPlanoAtivo } from "@/lib/aluno-acesso";
import { labelsModulos } from "@/lib/modulos-aluno";
import {
  deveMostrarAvisoVencimento,
  diasRestantesPlano,
  planoVencido,
} from "@/lib/plano-vencimento";

interface AlunoCardProps {
  aluno: Aluno;
  /** Dias antes do vencimento para mostrar alerta (padrão 5). */
  diasAviso?: number;
}

function formatarData(dataIso?: string | null): string {
  if (!dataIso) return "—";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "—";
  return data.toLocaleDateString("pt-BR");
}

export function AlunoCard({ aluno, diasAviso = 5 }: AlunoCardProps) {
  const router = useRouter();

  const ativo = alunoPlanoAtivo({
    planoVenceEm: aluno.planoVenceEm,
    modulosAtivos: aluno.modulosAtivos,
  });
  const vencido = planoVencido(aluno.planoVenceEm);
  const dias = diasRestantesPlano(aluno.planoVenceEm);
  const alerta =
    ativo && deveMostrarAvisoVencimento(aluno.planoVenceEm, diasAviso);

  const modulosLabel =
    aluno.modulosAtivos && aluno.modulosAtivos.length > 0
      ? labelsModulos(aluno.modulosAtivos)
      : null;

  let statusLabel = "Sem plano";
  let statusClass = "aluno-lista-status--inativo";
  if (ativo) {
    statusLabel = "Ativo";
    statusClass = "aluno-lista-status--ativo";
  } else if (vencido) {
    statusLabel = "Vencido";
    statusClass = "aluno-lista-status--vencido";
  }

  let vencimentoTexto = "Sem data de expiração";
  if (aluno.planoVenceEm) {
    if (vencido) {
      vencimentoTexto = `Venceu em ${formatarData(aluno.planoVenceEm)}`;
    } else if (dias === 0) {
      vencimentoTexto = "Expira hoje";
    } else if (dias === 1) {
      vencimentoTexto = "Expira amanhã";
    } else if (dias != null && dias > 0) {
      vencimentoTexto = `Expira em ${formatarData(aluno.planoVenceEm)}`;
    }
  }

  return (
    <button
      type="button"
      className={`aluno-lista-item${alerta ? " aluno-lista-item--alerta" : ""}`}
      onClick={() => router.push(`/professor/alunos/${aluno.id}`)}
    >
      <div className="aluno-lista-avatar" aria-hidden>
        <User size={18} />
      </div>

      <div className="aluno-lista-body">
        <div className="aluno-lista-top">
          <h3 className="aluno-lista-nome">{aluno.nomeCompleto}</h3>
          <span className={`aluno-lista-status ${statusClass}`}>{statusLabel}</span>
        </div>

        <p className="aluno-lista-meta">
          {modulosLabel ? `${modulosLabel} · ` : null}
          {vencimentoTexto}
        </p>
      </div>

      {alerta ? (
        <span
          className="aluno-lista-alerta"
          title={
            dias === 0
              ? "Plano expira hoje"
              : `Plano vence em ${dias} dia(s)`
          }
        >
          <AlertTriangle size={18} aria-hidden />
          <span className="sr-only">Alerta: plano próximo do vencimento</span>
        </span>
      ) : null}

      <ChevronRight size={18} className="aluno-lista-chevron" aria-hidden />
    </button>
  );
}
