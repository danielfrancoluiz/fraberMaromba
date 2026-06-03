import { NextRequest, NextResponse } from "next/server";
import { requireAlunoSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  buscarSessaoCompleta,
  mapSessaoComCatalogo,
  resolveAlunoId,
} from "@/lib/sessao-treino-server";
import { mensagemErroBanco } from "@/lib/erro-banco";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAlunoSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = await resolveAlunoId(session);
    if (!alunoId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const { id } = await context.params;
    const sessao = await prisma.treinoSessao.findFirst({
      where: { id, alunoId },
    });

    if (!sessao) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    if (sessao.status !== "em_andamento") {
      return NextResponse.json(
        { error: "Sessão já finalizada" },
        { status: 400 }
      );
    }

    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const dados = body as Record<string, unknown>;
    const acao = dados.acao;

    if (acao === "marcar_serie") {
      const exercicioId = dados.exercicioId;
      const numeroSerie = dados.numeroSerie;
      if (typeof exercicioId !== "string" || typeof numeroSerie !== "number") {
        return NextResponse.json({ error: "Dados da série inválidos" }, { status: 400 });
      }

      await prisma.treinoSessaoSerie.updateMany({
        where: { sessaoId: id, exercicioId, numeroSerie },
        data: { concluida: true },
      });
    } else if (acao === "substituir") {
      const exercicioId = dados.exercicioId;
      const substitutoCatalogoId = dados.substitutoCatalogoId;
      if (typeof exercicioId !== "string" || typeof substitutoCatalogoId !== "string") {
        return NextResponse.json({ error: "Dados de substituição inválidos" }, { status: 400 });
      }

      await prisma.treinoSessaoSerie.updateMany({
        where: { sessaoId: id, exercicioId },
        data: { substitutoCatalogoId },
      });
    } else if (acao === "finalizar") {
      const duracaoSegundos =
        typeof dados.duracaoSegundos === "number"
          ? Math.max(0, Math.floor(dados.duracaoSegundos))
          : null;

      await prisma.treinoSessao.update({
        where: { id },
        data: {
          status: "concluido",
          finalizadoEm: new Date(),
          duracaoSegundos,
        },
      });
    } else if (acao === "cancelar") {
      await prisma.treinoSessao.update({
        where: { id },
        data: {
          status: "cancelado",
          finalizadoEm: new Date(),
        },
      });
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const atualizada = await buscarSessaoCompleta(id);
    return NextResponse.json({ sessao: await mapSessaoComCatalogo(atualizada) });
  } catch (error) {
    console.error("[PATCH /api/aluno/sessoes/[id]]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAlunoSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = await resolveAlunoId(session);
    if (!alunoId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const { id } = await context.params;
    const sessao = await prisma.treinoSessao.findFirst({
      where: { id, alunoId },
      include: {
        treino: { select: { id: true, nome: true, diaSemana: true } },
        series: {
          orderBy: [{ exercicioId: "asc" }, { numeroSerie: "asc" }],
        },
      },
    });

    if (!sessao) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ sessao: await mapSessaoComCatalogo(sessao) });
  } catch (error) {
    console.error("[GET /api/aluno/sessoes/[id]]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
