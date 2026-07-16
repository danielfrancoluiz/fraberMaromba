import { cookies } from "next/headers";
import { CONVITE_COOKIE } from "@/lib/convite-cookie-name";
import { GOOGLE_ROLE_COOKIE } from "@/lib/google-role-cookie-name";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/lib/senha";
import {
  carregarDadosSessaoPorEmail,
  type DadosSessaoUsuario,
} from "@/lib/sessao-usuario";

export class GoogleCadastroError extends Error {
  constructor(
    message: string,
    public readonly codigo: "CONVITE_OBRIGATORIO" | "CONVITE_INVALIDO"
  ) {
    super(message);
    this.name = "GoogleCadastroError";
  }
}

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
): Promise<DadosSessaoUsuario> {
  const convite = await prisma.convite.findUnique({
    where: { token: tokenConvite },
  });

  if (!convite || convite.usado) {
    throw new GoogleCadastroError(
      "Convite inválido ou já utilizado.",
      "CONVITE_INVALIDO"
    );
  }

  if (
    convite.email &&
    convite.email.trim().toLowerCase() !== email.trim().toLowerCase()
  ) {
    throw new GoogleCadastroError(
      "Este convite é para outro email.",
      "CONVITE_INVALIDO"
    );
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

  const dados = await carregarDadosSessaoPorEmail(email);
  if (!dados) {
    throw new Error("Falha ao carregar sessão após cadastro Google");
  }
  return dados;
}

/**
 * Garante usuário no banco para login Google.
 * Role definida pelo cookie (escolha antes do OAuth).
 * Aluno exige convite válido.
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
  const roleIntent = cookieStore.get(GOOGLE_ROLE_COOKIE)?.value?.trim();

  cookieStore.delete(GOOGLE_ROLE_COOKIE);

  const querAluno = roleIntent === "aluno" || Boolean(tokenConvite);

  if (querAluno) {
    if (!tokenConvite) {
      cookieStore.delete(CONVITE_COOKIE);
      throw new GoogleCadastroError(
        "Alunos precisam de um link de convite do professor.",
        "CONVITE_OBRIGATORIO"
      );
    }

    try {
      const aluno = await criarAlunoGoogle(nome, email, tokenConvite);
      cookieStore.delete(CONVITE_COOKIE);
      return aluno;
    } catch (error) {
      cookieStore.delete(CONVITE_COOKIE);
      throw error;
    }
  }

  cookieStore.delete(CONVITE_COOKIE);
  return criarProfessorGoogle(nome, email);
}
