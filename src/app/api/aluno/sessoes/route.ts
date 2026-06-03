import { NextRequest, NextResponse } from "next/server";
import { requireAlunoSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  assertTreinoDoAluno,
  buscarSessaoCompleta,
  criarSeriesParaSessao,
  mapSessaoComCatalogo,
  resolveAlunoId,
  sessaoInclude,
} from "@/lib/sessao-treino-server";
import { mensagemErroBanco } from "@/lib/erro-banco";

const LIMITE_PADRAO = 15;
const LIMITE_MAX = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await requireAlunoSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = await resolveAlunoId(session);
    if (!alunoId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const params = req.nextUrl.searchParams;
    const stats = params.get("stats") === "1";

    if (stats) {
      const [concluidas, agregado, ultimas] = await Promise.all([
        prisma.treinoSessao.count({
          where: { alunoId, status: "concluido" },
        }),
        prisma.treinoSessao.aggregate({
          where: { alunoId, status: "concluido", duracaoSegundos: { not: null } },
          _sum: { duracaoSegundos: true },
        }),
        prisma.treinoSessao.findMany({
          where: { alunoId, status: "concluido" },
          orderBy: { finalizadoEm: "desc" },
          take: 3,
          include: { treino: { select: { nome: true, diaSemana: true } } },
        }),
      ]);

      const aluno = await prisma.aluno.findUnique({
        where: { id: alunoId },
        select: { planoId: true, status: true },
      });

      const minutosTotais = Math.round(
        (agregado._sum.duracaoSegundos ?? 0) / 60
      );

      return NextResponse.json({
        treinosConcluidos: concluidas,
        minutosTotais,
        planosAtivos:
          aluno?.status === "ativo_professor" || aluno?.status === "ativo_plataforma"
            ? 1
            : 0,
        planoId: aluno?.planoId ?? null,
        ultimasSessoes: ultimas.map((s) => ({
          id: s.id,
          treinoId: s.treinoId,
          treinoNome: s.treino.nome,
          treinoDiaSemana: s.treino.diaSemana,
          finalizadoEm: s.finalizadoEm?.toISOString() ?? null,
          duracaoSegundos: s.duracaoSegundos,
        })),
      });
    }

    const treinoId = params.get("treinoId")?.trim();
    const status = params.get("status")?.trim();

    if (treinoId && status === "em_andamento") {
      const ativa = await prisma.treinoSessao.findFirst({
        where: { alunoId, treinoId, status: "em_andamento" },
        include: sessaoInclude,
        orderBy: { iniciadoEm: "desc" },
      });
      return NextResponse.json({
        sessao: ativa ? await mapSessaoComCatalogo(ativa) : null,
      });
    }

    const pagina = Math.max(1, Number.parseInt(params.get("pagina") ?? "1", 10) || 1);
    const limiteRaw = Number.parseInt(params.get("limite") ?? String(LIMITE_PADRAO), 10);
    const limite = Math.min(
      LIMITE_MAX,
      Math.max(1, Number.isNaN(limiteRaw) ? LIMITE_PADRAO : limiteRaw)
    );
    const skip = (pagina - 1) * limite;

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
    console.error("[GET /api/aluno/sessoes]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAlunoSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = await resolveAlunoId(session);
    if (!alunoId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null || typeof (body as { treinoId?: unknown }).treinoId !== "string") {
      return NextResponse.json({ error: "treinoId é obrigatório" }, { status: 400 });
    }

    const { treinoId } = body as { treinoId: string };

    if (!(await assertTreinoDoAluno(treinoId, alunoId))) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    const existente = await prisma.treinoSessao.findFirst({
      where: { alunoId, treinoId, status: "em_andamento" },
      include: sessaoInclude,
      orderBy: { iniciadoEm: "desc" },
    });

    if (existente) {
      return NextResponse.json({ sessao: await mapSessaoComCatalogo(existente) });
    }

    const sessao = await prisma.treinoSessao.create({
      data: {
        treinoId,
        alunoId,
        status: "em_andamento",
      },
      include: sessaoInclude,
    });

    await criarSeriesParaSessao(sessao.id, treinoId);

    const completa = await buscarSessaoCompleta(sessao.id);
    return NextResponse.json(
      { sessao: await mapSessaoComCatalogo(completa) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/aluno/sessoes]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
