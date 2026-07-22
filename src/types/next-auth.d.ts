import "next-auth";
import "next-auth/jwt";
import type { ModuloAlunoId } from "@/lib/modulos-aluno";

declare module "next-auth" {
  interface User {
    id: string;
    role: "professor" | "aluno";
    status: "ativo_professor" | "ativo_plataforma" | "inativo";
    professorId?: string;
    alunoId?: string;
    planoId?: string;
    planoVenceEm?: string;
    modulosAtivos?: ModuloAlunoId[];
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "professor" | "aluno";
      status: "ativo_professor" | "ativo_plataforma" | "inativo";
      professorId?: string;
      alunoId?: string;
      planoId?: string;
      planoVenceEm?: string;
      modulosAtivos?: ModuloAlunoId[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "professor" | "aluno";
    status: "ativo_professor" | "ativo_plataforma" | "inativo";
    professorId?: string;
    alunoId?: string;
    planoId?: string;
    planoVenceEm?: string;
    modulosAtivos?: ModuloAlunoId[];
    lastDbSync?: number;
  }
}
