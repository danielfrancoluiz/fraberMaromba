import { prisma } from "@/lib/prisma";
import { hashSenha, senhaConfere, isBcryptHash } from "@/lib/senha";
import { carregarDadosSessaoPorEmail, type DadosSessaoUsuario } from "@/lib/sessao-usuario";

export type UsuarioAutenticado = DadosSessaoUsuario;

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

  return carregarDadosSessaoPorEmail(usuario.email);
}
