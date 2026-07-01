"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Trophy,
  Activity,
  User,
  CreditCard,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { buscarEstatisticasSessaoAluno } from "@/services/sessaoService";
import { EstatisticasSessaoAluno } from "@/types";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  desc: string;
  href?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "treino",
    label: "Treino",
    icon: ClipboardList,
    color: "#e02020",
    bg: "rgba(224,32,32,0.12)",
    desc: "Seu plano de treino",
    href: "/aluno/treinos",
  },
  {
    id: "records",
    label: "Records",
    icon: Trophy,
    color: "#f5a623",
    bg: "rgba(245,166,35,0.12)",
    desc: "Seus recordes pessoais",
    href: "/aluno/historico",
  },
  {
    id: "avaliacao",
    label: "Avaliação Física",
    icon: Activity,
    color: "#2b7de9",
    bg: "rgba(43,125,233,0.12)",
    desc: "Acompanhe seu corpo",
  },
  {
    id: "perfil",
    label: "Meu Perfil",
    icon: User,
    color: "#9b59b6",
    bg: "rgba(155,89,182,0.12)",
    desc: "Suas informações",
    href: "/aluno/perfil",
  },
  {
    id: "plano",
    label: "Plano",
    icon: CreditCard,
    color: "#27ae60",
    bg: "rgba(39,174,96,0.12)",
    desc: "Gerencie seu plano",
    href: "/aluno/perfil",
  },
];

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="student-stat-card">
      <span className="student-stat-value" style={{ color }}>
        {value}
      </span>
      <span className="student-stat-label">{label}</span>
    </div>
  );
}

export function AlunoHome360() {
  const router = useRouter();
  const [stats, setStats] = useState<EstatisticasSessaoAluno | null>(null);

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

  const completed = stats?.treinosConcluidos ?? 0;
  const frequency =
    completed > 0 ? Math.min(100, Math.round((completed / 12) * 100)) : 0;

  return (
    <div className="student-home-stack">
      <div className="student-welcome-banner">
        <p className="student-welcome-kicker">Bem-vindo de volta</p>
        <h2 className="student-welcome-title">Bora treinar hoje? 💪</h2>
        <p className="student-welcome-sub">Continue sua jornada FRABER 360°</p>
        <button
          type="button"
          className="student-welcome-cta"
          onClick={() => router.push("/aluno/treinos")}
        >
          Ver meu treino
        </button>
      </div>

      <div className="student-stats-row">
        <StatCard value={String(completed)} label="Treinos" color="#e02020" />
        <StatCard value={`${frequency}%`} label="Frequência" color="#2b7de9" />
        <StatCard value="—" label="Evolução" color="#27ae60" />
      </div>

      <div>
        <div className="student-quick-header">
          <h3 className="student-quick-title">Acesso Rápido</h3>
          <Link href="/aluno/treinos" className="student-quick-link">
            Ver tudo
          </Link>
        </div>
        <div className="student-quick-grid">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const inner = (
              <>
                <div
                  className="student-quick-icon"
                  style={{ background: `${item.color}22` }}
                >
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="student-quick-label">{item.label}</p>
                  <p className="student-quick-desc">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="student-quick-chevron" style={{ color: item.color }} />
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="student-quick-card"
                  style={{
                    background: item.bg,
                    borderColor: `${item.color}22`,
                  }}
                >
                  {inner}
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                className="student-quick-card student-quick-card--static"
                style={{
                  background: item.bg,
                  borderColor: `${item.color}22`,
                }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
