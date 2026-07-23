import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { resolveAlunoId } from "@/lib/sessao-treino-server";
import { mapTreinoCorridaRow } from "@/lib/treino-corrida";

export async function GET(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "aluno") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = await resolveAlunoId(session);
    if (!alunoId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const de = req.nextUrl.searchParams.get("de")?.trim();
    const ate = req.nextUrl.searchParams.get("ate")?.trim();
    const data = req.nextUrl.searchParams.get("data")?.trim();

    const where: {
      alunoId: string;
      status?: { not: string };
      data?: { gte?: Date; lte?: Date; equals?: Date };
    } = {
      alunoId,
      status: { not: "cancelado" },
    };

    if (data && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      where.data = { equals: new Date(`${data}T12:00:00.000Z`) };
    } else if (de || ate) {
      where.data = {};
      if (de) where.data.gte = new Date(`${de}T00:00:00.000Z`);
      if (ate) where.data.lte = new Date(`${ate}T23:59:59.999Z`);
    }

    const rows = await prisma.treinoCorrida.findMany({
      where,
      orderBy: [{ data: "asc" }, { criadoEm: "asc" }],
      take: 40,
    });

    return NextResponse.json(rows.map(mapTreinoCorridaRow));
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar treinos de corrida";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
