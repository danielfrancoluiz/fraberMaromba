"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Dumbbell,
  Salad,
  Trophy,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { listarTreinosDoAlunoPorDia } from "@/services/alunoService";
import { buscarEstatisticasSessaoAluno } from "@/services/sessaoService";
import { EstatisticasSessaoAluno, Treino } from "@/types";
import {
  moduloVigente,
  type ModuloAlunoId,
} from "@/lib/modulos-aluno";

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

function formatarVencimento(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
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

function ModuloQuickLink({
  href,
  icon: Icon,
  titulo,
  detalhe,
}: {
  href: string;
  icon: LucideIcon;
  titulo: string;
  detalhe?: string | null;
}) {
  return (
    <Link href={href} className="student-quick-link">
      <Icon size={18} />
      <span className="student-quick-link-title">{titulo}</span>
      {detalhe ? (
        <span className="student-quick-link-meta">{detalhe}</span>
      ) : null}
    </Link>
  );
}

export function AlunoHome360() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<EstatisticasSessaoAluno | null>(null);
  const [treinoHoje, setTreinoHoje] = useState<Treino | null>(null);

  const primeiroNome = session?.user?.name?.split(" ")[0];
  const diaAtual = getDiaSemanaAtual();
  const alunoId = session?.user?.alunoId ?? session?.user?.id;

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
    if (!alunoId || status !== "authenticated") return;
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
  }, [alunoId, diaAtual, status]);

  const modulosAtivos = useMemo(() => {
    const venc = session?.user?.modulosVencimentos ?? {};
    const ids: ModuloAlunoId[] = ["musculacao", "corrida", "nutricao"];
    if (venc && Object.keys(venc).length > 0) {
      return ids.filter((id) => moduloVigente(venc[id]));
    }
    return (session?.user?.modulosAtivos ?? []) as ModuloAlunoId[];
  }, [session?.user?.modulosAtivos, session?.user?.modulosVencimentos]);

  const temMusc = modulosAtivos.includes("musculacao");
  const temCorrida = modulosAtivos.includes("corrida");
  const temNutri = modulosAtivos.includes("nutricao");

  const vencMusc = formatarVencimento(
    session?.user?.modulosVencimentos?.musculacao ?? session?.user?.planoVenceEm
  );
  const vencCorrida = formatarVencimento(
    session?.user?.modulosVencimentos?.corrida
  );
  const vencNutri = formatarVencimento(
    session?.user?.modulosVencimentos?.nutricao
  );

  const completed = stats?.treinosConcluidos ?? 0;
  const frequency =
    completed > 0 ? Math.min(100, Math.round((completed / 12) * 100)) : 0;

  return (
    <div className="student-home-stack">
      <section className="student-greeting student-greeting--hero">
        <p className="student-greeting-kicker">Início</p>
        <h1 className="student-greeting-label">
          {primeiroNome
            ? `Bem-vindo de volta, ${primeiroNome}`
            : "Bem-vindo de volta"}
        </h1>
      </section>

      <div className="student-quick-links">
        <ModuloQuickLink
          href={temMusc ? "/aluno/treinos" : "/aluno/planos"}
          icon={Dumbbell}
          titulo={temMusc ? "Musculação" : "Contratar musculação"}
          detalhe={temMusc && vencMusc ? `até ${vencMusc}` : null}
        />
        <ModuloQuickLink
          href={temCorrida ? "/aluno/corrida" : "/aluno/planos"}
          icon={Wind}
          titulo={temCorrida ? "Corrida" : "Contratar corrida"}
          detalhe={temCorrida && vencCorrida ? `até ${vencCorrida}` : null}
        />
        <ModuloQuickLink
          href="/aluno/nutricao"
          icon={Salad}
          titulo={temNutri ? "Nutrição" : "Contratar nutrição"}
          detalhe={temNutri && vencNutri ? `até ${vencNutri}` : null}
        />
      </div>

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
      ) : temMusc ? (
        <div className="student-today-card student-today-card--empty">
          <p className="student-today-empty-title">Sem treino hoje</p>
          <p className="student-today-empty-desc">
            Veja a programação completa na aba Musculação.
          </p>
          <button
            type="button"
            className="student-cta"
            onClick={() => router.push("/aluno/treinos")}
          >
            Ver programação
          </button>
        </div>
      ) : (
        <div className="student-today-card student-today-card--empty">
          <p className="student-today-empty-title">Musculação bloqueada</p>
          <p className="student-today-empty-desc">
            Contrate o módulo para ver e executar seus treinos.
          </p>
          <button
            type="button"
            className="student-cta"
            onClick={() => router.push("/aluno/planos")}
          >
            Contratar musculação
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
