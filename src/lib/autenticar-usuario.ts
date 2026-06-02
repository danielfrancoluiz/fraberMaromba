import { prisma } from "@/lib/prisma";
import { hashSenha, verificarSenha } from "@/lib/senha";

export type UsuarioAutenticado = {
  id: string;
  nome: string;
  email: string;
  role: "professor" | "aluno";
  status: "ativo_professor" | "ativo_plataforma" | "inativo";
  professorId?: string;
};

function isBcryptHash(valor: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(valor);
}

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

async function senhaConfere(
  senhaInformada: string,
  senhaArmazenada: string
): Promise<boolean> {
  if (isBcryptHash(senhaArmazenada)) {
    return verificarSenha(senhaInformada, senhaArmazenada);
  }
  // Legado: registro manual no Supabase com senha em texto puro
  return senhaInformada === senhaArmazenada;
}

export async function autenticarUsuario(
  email: string,
  senha: string
): Promise<UsuarioAutenticado | null> {
  const emailNormalizado = email.trim().toLowerCase();

  const usuario = await prisma.usuario.findFirst({
    where: {
      email: { equals: emailNormalizado, mode: "insensitive" },
    },
  });

  if (!usuario) {
    console.warn("[auth] usuário não encontrado:", emailNormalizado);
    return null;
  }

  const confere = await senhaConfere(senha, usuario.senha);
  if (!confere) {
    console.warn("[auth] senha incorreta:", emailNormalizado);
    return null;
  }

  if (!isBcryptHash(usuario.senha)) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: await hashSenha(senha) },
    });
  }

  const role = usuario.role.trim().toLowerCase();
  const status = usuario.status.trim().toLowerCase();

  if (!isRole(role) || !isStatus(status)) {
    console.warn("[auth] role/status inválido:", emailNormalizado, role, status);
    return null;
  }

  let professorId: string | undefined;

  if (role === "aluno") {
    const aluno = await prisma.aluno.findFirst({
      where: {
        OR: [{ usuarioId: usuario.id }, { id: usuario.id }],
      },
    });
    professorId = aluno?.professorId;
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role,
    status,
    professorId,
  };
}
