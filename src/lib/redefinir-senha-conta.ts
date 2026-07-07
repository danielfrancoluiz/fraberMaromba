import { prisma } from "@/lib/prisma";
import { normalizarEmail } from "@/lib/email";

/** Atualiza senha pelo e-mail, inclusive alunos cadastrados só na tabela Aluno. */
export async function redefinirSenhaPorEmail(
  email: string,
  senhaHash: string
): Promise<"ok" | "nao_encontrado"> {
  const emailNormalizado = normalizarEmail(email);

  const usuario = await prisma.usuario.findFirst({
    where: { email: { equals: emailNormalizado, mode: "insensitive" } },
    select: { id: true },
  });

  if (usuario) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash },
    });
    return "ok";
  }

  const aluno = await prisma.aluno.findFirst({
    where: { email: { equals: emailNormalizado, mode: "insensitive" } },
    select: { id: true, usuarioId: true, nomeCompleto: true, email: true },
  });

  if (!aluno) {
    return "nao_encontrado";
  }

  if (aluno.usuarioId) {
    await prisma.usuario.update({
      where: { id: aluno.usuarioId },
      data: { senha: senhaHash },
    });
    return "ok";
  }

  const usuarioMesmoEmail = await prisma.usuario.findFirst({
    where: { email: { equals: emailNormalizado, mode: "insensitive" } },
    select: { id: true },
  });

  if (usuarioMesmoEmail) {
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioMesmoEmail.id },
        data: { senha: senhaHash },
      }),
      prisma.aluno.update({
        where: { id: aluno.id },
        data: { usuarioId: usuarioMesmoEmail.id },
      }),
    ]);
    return "ok";
  }

  await prisma.$transaction(async (tx) => {
    const novoUsuario = await tx.usuario.create({
      data: {
        nome: aluno.nomeCompleto,
        email: normalizarEmail(aluno.email),
        senha: senhaHash,
        role: "aluno",
        status: "ativo_professor",
      },
    });

    await tx.aluno.update({
      where: { id: aluno.id },
      data: { usuarioId: novoUsuario.id },
    });
  });

  return "ok";
}
