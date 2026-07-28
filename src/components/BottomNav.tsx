"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { Dumbbell, Home, Library, Salad, User, Users, Wind } from "lucide-react";
import { moduloVigente, type ModuloAlunoId } from "@/lib/modulos-aluno";

type NavRole = "aluno" | "professor";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Home;
  match?: (path: string) => boolean;
}

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
  {
    id: "corrida",
    label: "Corrida",
    href: "/professor/corrida",
    icon: Wind,
    match: (path) => path.startsWith("/professor/corrida"),
  },
  {
    id: "exercicios",
    label: "Exercícios",
    href: "/professor/exercicios",
    icon: Library,
    match: (path) => path.startsWith("/professor/exercicios"),
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

function temModulo(
  user:
    | {
        modulosAtivos?: string[];
        modulosVencimentos?: Partial<Record<string, string>>;
      }
    | undefined,
  modulo: ModuloAlunoId
): boolean {
  if (!user) return false;
  const venc = user.modulosVencimentos;
  if (venc && Object.keys(venc).length > 0) {
    return moduloVigente(venc[modulo]);
  }
  return (user.modulosAtivos ?? []).includes(modulo);
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const items = useMemo(() => {
    if (role === "professor") return professorNav;

    const temMusc = temModulo(session?.user, "musculacao");
    const temCorrida = temModulo(session?.user, "corrida");

    // Mesmo caminho dos tiles do início: sem módulo → /aluno/planos
    return [
      { id: "home", label: "Início", href: "/aluno/dashboard", icon: Home },
      {
        id: "musculacao",
        label: "Musculação",
        href: temMusc ? "/aluno/treinos" : "/aluno/planos",
        icon: Dumbbell,
        match: (path: string) =>
          path.startsWith("/aluno/treinos") || path.startsWith("/aluno/treino/"),
      },
      {
        id: "corrida",
        label: "Corrida",
        href: temCorrida ? "/aluno/corrida" : "/aluno/planos",
        icon: Wind,
        match: (path: string) => path.startsWith("/aluno/corrida"),
      },
      {
        id: "nutricao",
        label: "Nutrição",
        href: "/aluno/nutricao",
        icon: Salad,
        match: (path: string) => path.startsWith("/aluno/nutricao"),
      },
    ] satisfies NavItem[];
  }, [role, session?.user]);

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
