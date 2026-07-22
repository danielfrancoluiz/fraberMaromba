import { prisma } from "@/lib/prisma";
import { alunoPlanoAtivo } from "@/lib/aluno-acesso";
import { normalizarModulos, type ModuloAlunoId } from "@/lib/modulos-aluno";

export type DadosSessaoUsuario = {
  id: string;
  nome: string;
  email: string;
  role: "professor" | "aluno";
  status: "ativo_professor" | "ativo_plataforma" | "inativo";
  professorId?: string;
  alunoId?: string;
  planoId?: string;
  /** ISO string da data de vencimento do plano. */
  planoVenceEm?: string;
  /** Módulos ativos do aluno. */
  modulosAtivos?: ModuloAlunoId[];
};

export { alunoPlanoAtivo } from "@/lib/aluno-acesso";

function isRole(value: string): value is "professor" | "aluno" {
  return value === "professor" || value === "aluno";
}

function isStatus(
  value: string
): value is "ativo_professor" | "ativo_plataforma" | "inativo" {
  return (
    value === "ativo_professor" ||
    value === "ativo_plataforma" ||
    value === "inativo"
  );
}

export async function carregarDadosSessaoPorEmail(
  email: string
): Promise<DadosSessaoUsuario | null> {
  const emailNormalizado = email.trim().toLowerCase();

  const usuario = await prisma.usuario.findFirst({
    where: { email: { equals: emailNormalizado, mode: "insensitive" } },
  });

  if (!usuario) return null;

  const role = usuario.role.trim().toLowerCase();
  let statusRaw = usuario.status.trim().toLowerCase();

  if (!isRole(role) || !isStatus(statusRaw)) return null;

  let professorId: string | undefined;
  let alunoId: string | undefined;
  let planoId: string | undefined;
  let planoVenceEm: string | undefined;
  let modulosAtivos: ModuloAlunoId[] | undefined;

  if (role === "aluno") {
    const aluno = await prisma.aluno.findFirst({
      where: {
        OR: [{ usuarioId: usuario.id }, { id: usuario.id }],
      },
      select: {
        id: true,
        professorId: true,
        planoId: true,
        planoVenceEm: true,
        modulosAtivos: true,
        status: true,
      },
    });

    if (aluno) {
      alunoId = aluno.id;
      professorId = aluno.professorId;
      planoId = aluno.planoId || undefined;
      planoVenceEm = aluno.planoVenceEm?.toISOString();
      modulosAtivos = normalizarModulos(aluno.modulosAtivos);

      if (!alunoPlanoAtivo({ planoVenceEm, modulosAtivos })) {
        statusRaw = "inativo";
      } else if (statusRaw === "inativo") {
        statusRaw = "ativo_plataforma";
      }
    }
  } else if (role === "professor") {
    professorId = usuario.id;
    planoId = usuario.planoId ?? undefined;
    planoVenceEm = usuario.planoVenceEm?.toISOString();
  }

  if (!isStatus(statusRaw)) return null;

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role,
    status: statusRaw,
    professorId,
    alunoId,
    planoId,
    planoVenceEm,
    modulosAtivos,
  };
}

export async function carregarDadosSessaoPorId(
  usuarioId: string
): Promise<DadosSessaoUsuario | null> {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) return null;
  return carregarDadosSessaoPorEmail(usuario.email);
}
