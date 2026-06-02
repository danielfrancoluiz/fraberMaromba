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

    const treino = await prisma.treino.findFirst({
      where: { id, professorId: session.user.id },
      include: {
        exercicios: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    if (!treino) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    return NextResponse.json(treino);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao buscar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
