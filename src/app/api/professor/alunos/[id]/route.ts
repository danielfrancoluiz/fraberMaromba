import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireProfessorSession(_req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    const aluno = await prisma.aluno.findFirst({
      where: { id, professorId: session.user.id },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    return NextResponse.json(aluno);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao buscar aluno";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

interface AtualizarAlunoBody {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  peso?: number;
  altura?: number;
  objetivo?: string;
  planoId?: string;
}

function extrairAtualizacaoAluno(value: unknown): AtualizarAlunoBody | null {
  if (typeof value !== "object" || value === null) return null;

  const dados = value as Record<string, unknown>;
  const atualizacao: AtualizarAlunoBody = {};

  if (dados.nomeCompleto !== undefined) {
    if (typeof dados.nomeCompleto !== "string") return null;
    atualizacao.nomeCompleto = dados.nomeCompleto;
  }
  if (dados.email !== undefined) {
    if (typeof dados.email !== "string") return null;
    atualizacao.email = dados.email;
  }
  if (dados.telefone !== undefined) {
    if (typeof dados.telefone !== "string") return null;
    atualizacao.telefone = dados.telefone;
  }
  if (dados.peso !== undefined) {
    if (typeof dados.peso !== "number") return null;
    atualizacao.peso = dados.peso;
  }
  if (dados.altura !== undefined) {
    if (typeof dados.altura !== "number") return null;
    atualizacao.altura = dados.altura;
  }
  if (dados.objetivo !== undefined) {
    if (typeof dados.objetivo !== "string") return null;
    atualizacao.objetivo = dados.objetivo;
  }
  if (dados.planoId !== undefined) {
    if (typeof dados.planoId !== "string") return null;
    atualizacao.planoId = dados.planoId;
  }

  if (Object.keys(atualizacao).length === 0) return null;

  return atualizacao;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const body: unknown = await req.json();
    const dados = extrairAtualizacaoAluno(body);

    if (!dados) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const existente = await prisma.aluno.findFirst({
      where: { id, professorId: session.user.id },
    });

    if (!existente) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: dados,
    });

    return NextResponse.json(aluno);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao atualizar aluno";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
