"use client";

import { Flame, TrendingUp } from "lucide-react";
import { AvatarIniciais } from "@/components/AvatarIniciais";
import { getPrimeiroNome, getSaudacao } from "@/lib/greeting";

interface StatItem {
  valor: string | number;
  label: string;
}

interface DashboardHeroHeaderProps {
  nome: string;
  role: "aluno" | "professor";
  badgeExtra?: string;
  stats?: StatItem[];
}

export function DashboardHeroHeader({
  nome,
  role,
  badgeExtra,
  stats = [],
}: DashboardHeroHeaderProps) {
  const isProfessor = role === "professor";

  return (
    <header className="dashboard-hero">
      <div className="dashboard-hero-top">
        <div className="dashboard-hero-user">
          <AvatarIniciais nome={nome} size="lg" />
          <div>
            <p className="dashboard-hero-greeting">{getSaudacao()},</p>
            <h1 className="dashboard-hero-name">{getPrimeiroNome(nome)}</h1>
          </div>
        </div>
        <div className={`dashboard-hero-badge ${isProfessor ? "dashboard-hero-badge--professor" : ""}`}>
          {isProfessor ? (
            <>
              <TrendingUp size={14} />
              <span>Personal</span>
            </>
          ) : (
            <>
              <Flame size={14} />
              <span>{badgeExtra ?? "Aluno"}</span>
            </>
          )}
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="dashboard-hero-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="dashboard-hero-stat">
              <p className="dashboard-hero-stat-value">{stat.valor}</p>
              <p className="dashboard-hero-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  );
}
