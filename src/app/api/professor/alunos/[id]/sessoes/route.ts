import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  assertAlunoDoProfessor,
  mapSessaoComCatalogo,
  sessaoInclude,
} from "@/lib/sessao-treino-server";
import { mensagemErroBanco } from "@/lib/erro-banco";

type RouteContext = { params: Promise<{ id: string }> };

const LIMITE_PADRAO = 15;
const LIMITE_MAX = 50;

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: alunoId } = await context.params;

    if (!(await assertAlunoDoProfessor(alunoId, session.user.id))) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const params = req.nextUrl.searchParams;
    const stats = params.get("stats") === "1";

    if (stats) {
      const [concluidas, agregado] = await Promise.all([
        prisma.treinoSessao.count({
          where: { alunoId, status: "concluido" },
        }),
        prisma.treinoSessao.aggregate({
          where: { alunoId, status: "concluido", duracaoSegundos: { not: null } },
          _sum: { duracaoSegundos: true },
        }),
      ]);

      return NextResponse.json({
        treinosConcluidos: concluidas,
        minutosTotais: Math.round((agregado._sum.duracaoSegundos ?? 0) / 60),
      });
    }

    const pagina = Math.max(1, Number.parseInt(params.get("pagina") ?? "1", 10) || 1);
    const limiteRaw = Number.parseInt(params.get("limite") ?? String(LIMITE_PADRAO), 10);
    const limite = Math.min(
      LIMITE_MAX,
      Math.max(1, Number.isNaN(limiteRaw) ? LIMITE_PADRAO : limiteRaw)
    );
    const skip = (pagina - 1) * limite;
    const status = params.get("status")?.trim();

    const where = {
      alunoId,
      ...(status ? { status } : {}),
    };

    const [itens, total] = await Promise.all([
      prisma.treinoSessao.findMany({
        where,
        orderBy: { iniciadoEm: "desc" },
        skip,
        take: limite,
        include: sessaoInclude,
      }),
      prisma.treinoSessao.count({ where }),
    ]);

    return NextResponse.json({
      itens: await Promise.all(itens.map((s) => mapSessaoComCatalogo(s))),
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite) || 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/professor/alunos/[id]/sessoes]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
