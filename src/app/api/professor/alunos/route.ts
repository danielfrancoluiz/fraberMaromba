import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { normalizarEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunos = await prisma.aluno.findMany({
      where: { professorId: session.user.id },
      orderBy: { dataCadastro: "desc" },
    });

    return NextResponse.json(alunos);
  } catch (error) {
    console.error("[GET /api/professor/alunos]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}

interface CriarAlunoBody {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: string;
  dataNascimento: string;
  peso: number;
  altura: number;
  objetivo: string;
  planoId: string;
}

function isCriarAlunoBody(value: unknown): value is CriarAlunoBody {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  return (
    typeof dados.nomeCompleto === "string" &&
    typeof dados.cpf === "string" &&
    typeof dados.email === "string" &&
    typeof dados.telefone === "string" &&
    typeof dados.sexo === "string" &&
    typeof dados.dataNascimento === "string" &&
    typeof dados.peso === "number" &&
    typeof dados.altura === "number" &&
    typeof dados.objetivo === "string" &&
    typeof dados.planoId === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isCriarAlunoBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const aluno = await prisma.aluno.create({
      data: {
        ...body,
        email: normalizarEmail(body.email),
        professorId: session.user.id,
      },
    });

    return NextResponse.json(aluno, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao cadastrar aluno";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
