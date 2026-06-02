import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/lib/senha";

interface CadastroBody {
  nome: string;
  email: string;
  senha: string;
  tokenConvite?: string;
}

function isCadastroBody(value: unknown): value is CadastroBody {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  return (
    typeof dados.nome === "string" &&
    typeof dados.email === "string" &&
    typeof dados.senha === "string" &&
    (dados.tokenConvite === undefined || typeof dados.tokenConvite === "string")
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    if (!isCadastroBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const emailNormalizado = body.email.trim().toLowerCase();
    const nome = body.nome.trim();

    if (!nome || !emailNormalizado || !body.senha) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const emailExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (emailExistente) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    const senhaHash = await hashSenha(body.senha);

    if (body.tokenConvite) {
      const convite = await prisma.convite.findUnique({
        where: { token: body.tokenConvite },
      });

      if (!convite) {
        return NextResponse.json(
          { error: "Link de convite inválido." },
          { status: 400 }
        );
      }

      if (convite.usado) {
        return NextResponse.json(
          { error: "Este link de convite já foi utilizado." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: {
            nome,
            email: emailNormalizado,
            senha: senhaHash,
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
            email: emailNormalizado,
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
    } else {
      await prisma.usuario.create({
        data: {
          nome,
          email: emailNormalizado,
          senha: senhaHash,
          role: "professor",
          status: "ativo_plataforma",
        },
      });
    }

    return NextResponse.json({ sucesso: true }, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao cadastrar usuário";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
