"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  CreditCard,
  Dumbbell,
  Salad,
  Trophy,
  Wind,
} from "lucide-react";
import { listarTreinosDoAlunoPorDia } from "@/services/alunoService";
import { buscarEstatisticasSessaoAluno } from "@/services/sessaoService";
import { EstatisticasSessaoAluno, Treino } from "@/types";
import { atualizarSessaoComTimeout } from "@/lib/atualizar-sessao";
import {
  labelModulo,
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

export function AlunoHome360() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [stats, setStats] = useState<EstatisticasSessaoAluno | null>(null);
  const [treinoHoje, setTreinoHoje] = useState<Treino | null>(null);
  const [syncOk, setSyncOk] = useState(false);

  const primeiroNome = session?.user?.name?.split(" ")[0];
  const diaAtual = getDiaSemanaAtual();
  const alunoId = session?.user?.alunoId ?? session?.user?.id;

  // Após pagamento, o JWT pode estar desatualizado — força sync ao abrir o início.
  useEffect(() => {
    if (status !== "authenticated") return;
    let ativo = true;
    void atualizarSessaoComTimeout(() => update(), 8000).finally(() => {
      if (ativo) setSyncOk(true);
    });
    return () => {
      ativo = false;
    };
  }, [status, update]);

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
  }, [alunoId, diaAtual, syncOk]);

  const modulosAtivos = useMemo(() => {
    const venc = session?.user?.modulosVencimentos ?? {};
    const ids: ModuloAlunoId[] = ["musculacao", "corrida", "nutricao"];
    if (venc && Object.keys(venc).length > 0) {
      return ids.filter((id) => moduloVigente(venc[id]));
    }
    return (session?.user?.modulosAtivos ?? []) as ModuloAlunoId[];
  }, [session?.user?.modulosAtivos, session?.user?.modulosVencimentos]);

  const faltamTreino = useMemo(() => {
    const falta: { id: ModuloAlunoId; label: string; href: string }[] = [];
    if (!modulosAtivos.includes("musculacao")) {
      falta.push({ id: "musculacao", label: "Musculação", href: "/aluno/planos" });
    }
    if (!modulosAtivos.includes("corrida")) {
      falta.push({ id: "corrida", label: "Corrida", href: "/aluno/planos" });
    }
    return falta;
  }, [modulosAtivos]);

  const completed = stats?.treinosConcluidos ?? 0;
  const frequency =
    completed > 0 ? Math.min(100, Math.round((completed / 12) * 100)) : 0;

  const temMusc = modulosAtivos.includes("musculacao");

  return (
    <div className="student-home-stack">
      <section className="student-greeting student-greeting--hero">
        <p className="student-greeting-kicker">Início</p>
        <h1 className="student-greeting-label">
          {primeiroNome
            ? `Bem-vindo de volta, ${primeiroNome}`
            : "Bem-vindo de volta"}
        </h1>
        <p className="student-greeting-sub">
          Aqui está um resumo da sua conta e do que fazer agora.
        </p>
      </section>

      <section className="student-modules-card card">
        <p className="field-label" style={{ marginBottom: 10 }}>
          Seus módulos
        </p>
        {modulosAtivos.length === 0 ? (
          <p className="text-muted" style={{ margin: "0 0 12px" }}>
            Você ainda não tem módulos de treino ativos.
          </p>
        ) : (
          <ul className="student-modules-list">
            {modulosAtivos.map((id) => {
              const vence = formatarVencimento(
                session?.user?.modulosVencimentos?.[id] ??
                  session?.user?.planoVenceEm
              );
              return (
                <li key={id} className="student-modules-item">
                  <span className="student-modules-name">{labelModulo(id)}</span>
                  <span className="student-modules-meta text-muted">
                    {vence ? `até ${vence}` : "Ativo"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {faltamTreino.length > 0 ? (
          <Link href="/aluno/planos" className="btn-secondary btn-compact" style={{ marginTop: 8 }}>
            <CreditCard size={16} style={{ marginRight: 6 }} />
            Contratar{" "}
            {faltamTreino.map((f) => f.label).join(" ou ")}
          </Link>
        ) : (
          <p className="text-muted" style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
            Musculação e Corrida ativas neste período.
          </p>
        )}
      </section>

      <div className="student-quick-links">
        <Link
          href={temMusc ? "/aluno/treinos" : "/aluno/planos"}
          className="student-quick-link"
        >
          <Dumbbell size={18} />
          <span>{temMusc ? "Musculação" : "Liberar musculação"}</span>
        </Link>
        <Link
          href={
            modulosAtivos.includes("corrida")
              ? "/aluno/corrida"
              : "/aluno/planos"
          }
          className="student-quick-link"
        >
          <Wind size={18} />
          <span>
            {modulosAtivos.includes("corrida")
              ? "Corrida"
              : "Liberar corrida"}
          </span>
        </Link>
        <Link href="/aluno/nutricao" className="student-quick-link">
          <Salad size={18} />
          <span>Nutrição</span>
        </Link>
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
