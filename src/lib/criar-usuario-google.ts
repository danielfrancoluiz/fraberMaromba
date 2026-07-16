import { cookies } from "next/headers";
import { CONVITE_COOKIE } from "@/lib/convite-cookie-name";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/lib/senha";
import {
  carregarDadosSessaoPorEmail,
  type DadosSessaoUsuario,
} from "@/lib/sessao-usuario";

async function senhaOAuthPlaceholder(): Promise<string> {
  const aleatorio = `oauth-${crypto.randomUUID()}-${Date.now()}`;
  return hashSenha(aleatorio);
}

async function criarProfessorGoogle(
  nome: string,
  email: string
): Promise<DadosSessaoUsuario> {
  const senha = await senhaOAuthPlaceholder();

  await prisma.usuario.create({
    data: {
      nome,
      email,
      senha,
      role: "professor",
      status: "ativo_plataforma",
    },
  });

  const dados = await carregarDadosSessaoPorEmail(email);
  if (!dados) {
    throw new Error("Falha ao carregar sessão após cadastro Google");
  }
  return dados;
}

async function criarAlunoGoogle(
  nome: string,
  email: string,
  tokenConvite: string
): Promise<DadosSessaoUsuario | null> {
  const convite = await prisma.convite.findUnique({
    where: { token: tokenConvite },
  });

  if (!convite || convite.usado) return null;

  if (
    convite.email &&
    convite.email.trim().toLowerCase() !== email.trim().toLowerCase()
  ) {
    return null;
  }

  const senha = await senhaOAuthPlaceholder();

  await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        nome,
        email,
        senha,
        role: "aluno",
        status: "ativo_professor",
      },
    });

    await tx.aluno.create({
      data: {
        usuarioId: usuario.id,
        professorId: convite.professorId,
        nomeCompleto: nome,
        cpf: `pendente-${usuario.id}`,
        email,
        telefone: "",
        sexo: "outro",
        dataNascimento: "",
        peso: 0,
        altura: 0,
        objetivo: "",
        planoId: "",
        status: "ativo_professor",
      },
    });

    await tx.convite.update({
      where: { id: convite.id },
      data: { usado: true },
    });
  });

  return carregarDadosSessaoPorEmail(email);
}

/**
 * Garante usuário no banco para login Google.
 * Com cookie de convite válido → aluno; senão → professor.
 */
export async function garantirUsuarioGoogle(params: {
  nome: string;
  email: string;
}): Promise<DadosSessaoUsuario> {
  const email = params.email.trim().toLowerCase();
  const nome = params.nome.trim() || email;

  const existente = await carregarDadosSessaoPorEmail(email);
  if (existente) return existente;

  const cookieStore = await cookies();
  const tokenConvite = cookieStore.get(CONVITE_COOKIE)?.value?.trim();

  if (tokenConvite) {
    try {
      const aluno = await criarAlunoGoogle(nome, email, tokenConvite);
      if (aluno) {
        cookieStore.delete(CONVITE_COOKIE);
        return aluno;
      }
    } catch (error) {
      console.error("[auth] falha ao criar aluno via Google + convite:", error);
    }
    cookieStore.delete(CONVITE_COOKIE);
  }

  return criarProfessorGoogle(nome, email);
}
