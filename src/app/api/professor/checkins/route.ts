import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseDataFiltro(valor: string | null): Date | null {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const alunoId = searchParams.get("alunoId");
    const dataInicio = parseDataFiltro(searchParams.get("dataInicio"));
    const dataFim = parseDataFiltro(searchParams.get("dataFim"));

    if (searchParams.get("dataInicio") && !dataInicio) {
      return NextResponse.json({ error: "dataInicio inválida" }, { status: 400 });
    }

    if (searchParams.get("dataFim") && !dataFim) {
      return NextResponse.json({ error: "dataFim inválida" }, { status: 400 });
    }

    const filtroDataHora: Prisma.DateTimeFilter | undefined =
      dataInicio || dataFim
        ? {
            ...(dataInicio ? { gte: dataInicio } : {}),
            ...(dataFim ? { lte: dataFim } : {}),
          }
        : undefined;

    const checkins = await prisma.checkin.findMany({
      where: {
        aluno: {
          professorId: session.user.id,
          ...(alunoId ? { id: alunoId } : {}),
        },
        ...(filtroDataHora ? { dataHora: filtroDataHora } : {}),
      },
      include: {
        aluno: {
          select: {
            id: true,
            nomeCompleto: true,
            email: true,
            planoId: true,
            status: true,
          },
        },
      },
      orderBy: { dataHora: "desc" },
      take: 100,
    });

    return NextResponse.json(checkins);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar checkins";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
