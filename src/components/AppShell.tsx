"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

type ShellRole = "aluno" | "professor";

interface AppShellProps {
  role: ShellRole;
  children: React.ReactNode;
}

function shouldHideBottomNav(pathname: string, role: ShellRole): boolean {
  if (role === "aluno") {
    if (pathname.startsWith("/aluno/treino/")) return true;
    if (pathname === "/aluno/inativo") return true;
    return false;
  }

  if (pathname === "/professor/alunos/novo") return true;
  if (pathname === "/professor/treinos/novo") return true;
  if (/^\/professor\/alunos\/[^/]+$/.test(pathname)) return true;

  return false;
}

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  const showNav = !shouldHideBottomNav(pathname, role);

  return (
    <div className={`app-shell ${showNav ? "app-shell--with-nav" : ""}`}>
      <div className="app-shell-inner">{children}</div>
      {showNav ? <BottomNav role={role} /> : null}
    </div>
  );
}
