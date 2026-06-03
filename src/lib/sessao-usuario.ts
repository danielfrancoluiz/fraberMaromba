import { prisma } from "@/lib/prisma";

export type DadosSessaoUsuario = {
  id: string;
  nome: string;
  email: string;
  role: "professor" | "aluno";
  status: "ativo_professor" | "ativo_plataforma" | "inativo";
  professorId?: string;
  alunoId?: string;
  planoId?: string;
};

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
  const status = usuario.status.trim().toLowerCase();

  if (!isRole(role) || !isStatus(status)) return null;

  let professorId: string | undefined;
  let alunoId: string | undefined;
  let planoId: string | undefined;

  if (role === "aluno") {
    const aluno = await prisma.aluno.findFirst({
      where: {
        OR: [{ usuarioId: usuario.id }, { id: usuario.id }],
      },
      select: { id: true, professorId: true, planoId: true, status: true },
    });

    if (aluno) {
      alunoId = aluno.id;
      professorId = aluno.professorId;
      planoId = aluno.planoId;
      // Status de acesso: prioriza Usuario; se inativo no Usuario mas ativo no Aluno, mantém Usuario
    }
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role,
    status,
    professorId,
    alunoId,
    planoId,
  };
}

export async function carregarDadosSessaoPorId(
  usuarioId: string
): Promise<DadosSessaoUsuario | null> {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) return null;
  return carregarDadosSessaoPorEmail(usuario.email);
}
