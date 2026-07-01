"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, Salad, User, Users, Wind } from "lucide-react";

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
    id: "musculacao",
    label: "Musculação",
    href: "/aluno/treinos",
    icon: Dumbbell,
    match: (path) =>
      path.startsWith("/aluno/treinos") || path.startsWith("/aluno/treino/"),
  },
  {
    id: "corrida",
    label: "Corrida",
    href: "/aluno/corrida",
    icon: Wind,
    match: (path) => path.startsWith("/aluno/corrida"),
  },
  {
    id: "nutricao",
    label: "Nutrição",
    href: "/aluno/nutricao",
    icon: Salad,
    match: (path) => path.startsWith("/aluno/nutricao"),
  },
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

  const navClass =
    role === "aluno" ? "bottom-nav bottom-nav--aluno" : "bottom-nav";

  return (
    <nav className={navClass} aria-label="Navegação principal">
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
