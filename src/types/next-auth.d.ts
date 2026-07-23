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
    modulosVencimentos?: Partial<Record<ModuloAlunoId, string>>;
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
      modulosVencimentos?: Partial<Record<ModuloAlunoId, string>>;
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
    modulosVencimentos?: Partial<Record<ModuloAlunoId, string>>;
    lastDbSync?: number;
  }
}
