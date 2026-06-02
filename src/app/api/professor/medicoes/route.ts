import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

interface CriarMedicaoBody {
  alunoId: string;
  peso?: number;
  cintura?: number;
  quadril?: number;
  bracoDireito?: number;
  bracoEsquerdo?: number;
  coxaDireita?: number;
  coxaEsquerda?: number;
  observacao?: string;
}

function isNumeroOpcional(value: unknown): value is number | undefined {
  return value === undefined || typeof value === "number";
}

function isCriarMedicaoBody(value: unknown): value is CriarMedicaoBody {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  if (typeof dados.alunoId !== "string") return false;

  return (
    isNumeroOpcional(dados.peso) &&
    isNumeroOpcional(dados.cintura) &&
    isNumeroOpcional(dados.quadril) &&
    isNumeroOpcional(dados.bracoDireito) &&
    isNumeroOpcional(dados.bracoEsquerdo) &&
    isNumeroOpcional(dados.coxaDireita) &&
    isNumeroOpcional(dados.coxaEsquerda) &&
    (dados.observacao === undefined || typeof dados.observacao === "string")
  );
}

async function buscarAlunoDoProfessor(alunoId: string, professorId: string) {
  return prisma.aluno.findFirst({
    where: { id: alunoId, professorId },
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = req.nextUrl.searchParams.get("alunoId");
    if (!alunoId) {
      return NextResponse.json(
        { error: "alunoId é obrigatório" },
        { status: 400 }
      );
    }

    const aluno = await buscarAlunoDoProfessor(alunoId, session.user.id);
    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const medicoes = await prisma.medicaoFisica.findMany({
      where: { alunoId },
      orderBy: { dataMedicao: "desc" },
    });

    return NextResponse.json(medicoes);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar medições";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isCriarMedicaoBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const aluno = await buscarAlunoDoProfessor(body.alunoId, session.user.id);
    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const medicao = await prisma.medicaoFisica.create({
      data: {
        alunoId: body.alunoId,
        professorId: session.user.id,
        peso: body.peso,
        cintura: body.cintura,
        quadril: body.quadril,
        bracoDireito: body.bracoDireito,
        bracoEsquerdo: body.bracoEsquerdo,
        coxaDireita: body.coxaDireita,
        coxaEsquerda: body.coxaEsquerda,
        observacao: body.observacao,
      },
    });

    return NextResponse.json(medicao, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao registrar medição";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
