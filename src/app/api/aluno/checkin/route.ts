import { NextRequest, NextResponse } from "next/server";
import { requireAlunoSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

async function buscarAlunoDaSessao(userId: string) {
  return prisma.aluno.findFirst({
    where: {
      OR: [{ usuarioId: userId }, { id: userId }],
    },
  });
}

interface CriarCheckinBody {
  treinoId?: string;
  observacao?: string;
}

function isCriarCheckinBody(value: unknown): value is CriarCheckinBody {
  if (value === undefined || value === null) return true;
  if (typeof value !== "object") return false;

  const dados = value as Record<string, unknown>;

  return (
    (dados.treinoId === undefined || typeof dados.treinoId === "string") &&
    (dados.observacao === undefined || typeof dados.observacao === "string")
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAlunoSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const aluno = await buscarAlunoDaSessao(session.user.id);
    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const checkins = await prisma.checkin.findMany({
      where: { alunoId: aluno.id },
      orderBy: { dataHora: "desc" },
      take: 30,
    });

    return NextResponse.json(checkins);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar checkins";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAlunoSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const aluno = await buscarAlunoDaSessao(session.user.id);
    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const body: unknown = await req.json().catch(() => ({}));
    if (!isCriarCheckinBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const checkin = await prisma.checkin.create({
      data: {
        alunoId: aluno.id,
        treinoId: body.treinoId,
        observacao: body.observacao,
      },
    });

    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao registrar checkin";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
