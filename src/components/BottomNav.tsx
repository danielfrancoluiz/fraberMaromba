"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Dumbbell, Home, User, Users } from "lucide-react";

type NavRole = "aluno" | "professor";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Home;
  match?: (path: string) => boolean;
}

const alunoNav: NavItem[] = [
  { id: "home", label: "Início", href: "/aluno/dashboard", icon: Home },
  {
    id: "treinos",
    label: "Treinos",
    href: "/aluno/treinos",
    icon: Dumbbell,
    match: (path) => path.startsWith("/aluno/treinos"),
  },
  {
    id: "historico",
    label: "Histórico",
    href: "/aluno/historico",
    icon: BarChart2,
    match: (path) => path.startsWith("/aluno/historico"),
  },
  { id: "perfil", label: "Perfil", href: "/aluno/perfil", icon: User },
];

const professorNav: NavItem[] = [
  { id: "home", label: "Início", href: "/professor/dashboard", icon: Home },
  {
    id: "alunos",
    label: "Alunos",
    href: "/professor/alunos",
    icon: Users,
    match: (path) =>
      path === "/professor/alunos" ||
      (path.startsWith("/professor/alunos/") &&
        path !== "/professor/alunos/novo"),
  },
  {
    id: "treinos",
    label: "Treinos",
    href: "/professor/treinos",
    icon: Dumbbell,
    match: (path) => path.startsWith("/professor/treinos"),
  },
  { id: "perfil", label: "Perfil", href: "/professor/perfil", icon: User },
];

interface BottomNavProps {
  role: NavRole;
}

function isActive(item: NavItem, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = role === "professor" ? professorNav : alunoNav;

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item, pathname);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`bottom-nav-item ${active ? "bottom-nav-item--active" : ""}`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{item.label}</span>
              {active ? <span className="bottom-nav-indicator" /> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
