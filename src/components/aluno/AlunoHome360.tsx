"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ChevronRight, Dumbbell, Trophy } from "lucide-react";
import { listarTreinosDoAlunoPorDia } from "@/services/alunoService";
import { buscarEstatisticasSessaoAluno } from "@/services/sessaoService";
import { EstatisticasSessaoAluno, Treino } from "@/types";

function getDiaSemanaAtual(): string {
  const dias: Record<number, string> = {
    0: "domingo",
    1: "segunda",
    2: "terca",
    3: "quarta",
    4: "quinta",
    5: "sexta",
    6: "sabado",
  };
  return dias[new Date().getDay()] ?? "segunda";
}

function StatCard({
  value,
  label,
  highlight,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className={`student-stat-card${highlight ? " student-stat-card--highlight" : ""}`}>
      <span className="student-stat-value">{value}</span>
      <span className="student-stat-label">{label}</span>
    </div>
  );
}

export function AlunoHome360() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<EstatisticasSessaoAluno | null>(null);
  const [treinoHoje, setTreinoHoje] = useState<Treino | null>(null);

  const primeiroNome = session?.user?.name?.split(" ")[0];
  const diaAtual = getDiaSemanaAtual();

  useEffect(() => {
    let ativo = true;
    void buscarEstatisticasSessaoAluno()
      .then((dados) => {
        if (ativo) setStats(dados);
      })
      .catch(() => {
        if (ativo) setStats(null);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const alunoId = session?.user?.id;
    if (!alunoId) return;

    let ativo = true;

    void listarTreinosDoAlunoPorDia(alunoId)
      .then((treinos) => {
        if (!ativo) return;
        const doDia = treinos[diaAtual] ?? [];
        setTreinoHoje(doDia[0] ?? null);
      })
      .catch(() => {
        if (ativo) setTreinoHoje(null);
      });

    return () => {
      ativo = false;
    };
  }, [session?.user?.id, diaAtual]);

  const completed = stats?.treinosConcluidos ?? 0;
  const frequency =
    completed > 0 ? Math.min(100, Math.round((completed / 12) * 100)) : 0;

  return (
    <div className="student-home-stack">
      <section className="student-greeting">
        <p className="student-greeting-label">
          {primeiroNome ? `Olá, ${primeiroNome}` : "Olá"}
        </p>
        <p className="student-greeting-sub">Sua rotina FRABER 360°</p>
      </section>

      {treinoHoje ? (
        <button
          type="button"
          className="student-today-card"
          onClick={() => router.push(`/aluno/treino/${treinoHoje.id}`)}
        >
          <div className="student-today-icon">
            <Dumbbell size={20} />
          </div>
          <div className="student-today-body">
            <p className="student-today-kicker">Treino de hoje</p>
            <p className="student-today-title">{treinoHoje.nome}</p>
            <p className="student-today-meta">
              {treinoHoje.exercicios.length} exercícios
            </p>
          </div>
          <ChevronRight size={18} className="student-today-chevron" />
        </button>
      ) : (
        <div className="student-today-card student-today-card--empty">
          <p className="student-today-empty-title">Sem treino hoje</p>
          <p className="student-today-empty-desc">
            Confira sua programação na aba Musculação.
          </p>
          <button
            type="button"
            className="student-cta"
            onClick={() => router.push("/aluno/treinos")}
          >
            Ver programação
          </button>
        </div>
      )}

      <div className="student-stats-row">
        <StatCard value={String(completed)} label="Treinos" highlight />
        <StatCard value={`${frequency}%`} label="Frequência" />
      </div>

      <Link href="/aluno/historico" className="student-link-row">
        <div className="student-link-row-icon">
          <Trophy size={18} />
        </div>
        <div className="student-link-row-body">
          <p className="student-link-row-label">Histórico e records</p>
          <p className="student-link-row-desc">Acompanhe sua evolução</p>
        </div>
        <ChevronRight size={16} className="student-link-row-chevron" />
      </Link>
    </div>
  );
}
