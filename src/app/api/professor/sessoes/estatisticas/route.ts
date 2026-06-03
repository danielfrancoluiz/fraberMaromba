import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const professorId = session.user.id;

    const alunosIds = await prisma.aluno.findMany({
      where: { professorId },
      select: { id: true },
    });
    const ids = alunosIds.map((a) => a.id);

    if (ids.length === 0) {
      return NextResponse.json({
        treinosConcluidos: 0,
        minutosTotais: 0,
        sessoesEmAndamento: 0,
      });
    }

    const [concluidas, agregado, emAndamento] = await Promise.all([
      prisma.treinoSessao.count({
        where: { alunoId: { in: ids }, status: "concluido" },
      }),
      prisma.treinoSessao.aggregate({
        where: {
          alunoId: { in: ids },
          status: "concluido",
          duracaoSegundos: { not: null },
        },
        _sum: { duracaoSegundos: true },
      }),
      prisma.treinoSessao.count({
        where: { alunoId: { in: ids }, status: "em_andamento" },
      }),
    ]);

    return NextResponse.json({
      treinosConcluidos: concluidas,
      minutosTotais: Math.round((agregado._sum.duracaoSegundos ?? 0) / 60),
      sessoesEmAndamento: emAndamento,
    });
  } catch (error) {
    console.error("[GET /api/professor/sessoes/estatisticas]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
