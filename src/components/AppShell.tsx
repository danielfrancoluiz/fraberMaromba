"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { StudentAppHeader } from "@/components/aluno/StudentAppHeader";

type ShellRole = "aluno" | "professor";

interface AppShellProps {
  role: ShellRole;
  children: React.ReactNode;
}

function shouldHideAlunoChrome(pathname: string): boolean {
  if (pathname.startsWith("/aluno/treino/")) return true;
  if (pathname === "/aluno/inativo") return true;
  return false;
}

function shouldHideBottomNav(pathname: string, role: ShellRole): boolean {
  if (role === "aluno") {
    if (pathname.startsWith("/aluno/planos")) return true;
    return shouldHideAlunoChrome(pathname);
  }

  if (pathname === "/professor/alunos/novo") return true;
  if (pathname === "/professor/treinos/novo") return true;
  if (pathname === "/professor/exercicios/novo") return true;
  if (/^\/professor\/exercicios\/[^/]+\/editar$/.test(pathname)) return true;
  if (/^\/professor\/alunos\/[^/]+$/.test(pathname)) return true;

  return false;
}

function isWideLayout(pathname: string, role: ShellRole): boolean {
  if (role === "professor" && /^\/professor\/alunos\/[^/]+$/.test(pathname)) {
    return true;
  }
  return false;
}

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  const showNav = !shouldHideBottomNav(pathname, role);
  const showAlunoHeader = role === "aluno" && !shouldHideAlunoChrome(pathname);
  const wide = isWideLayout(pathname, role);
  const isAluno = role === "aluno";

  return (
    <div
      className={[
        "app-shell",
        showNav ? "app-shell--with-nav" : "",
        showAlunoHeader ? "app-shell--with-header" : "",
        isAluno ? "aluno-shell" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showAlunoHeader ? <StudentAppHeader /> : null}
      <div className={`app-shell-inner${wide ? " app-shell-inner--wide" : ""}`}>
        {children}
      </div>
      {showNav ? <BottomNav role={role} /> : null}
    </div>
  );
}
