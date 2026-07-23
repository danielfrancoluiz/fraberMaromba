import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  isStatusTreinoCorrida,
  mapTreinoCorridaRow,
  parseEstruturaCorrida,
  validarEstrutura,
} from "@/lib/treino-corrida";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const row = await prisma.treinoCorrida.findFirst({
      where: { id, professorId: session.user.id },
      include: { aluno: { select: { nomeCompleto: true } } },
    });

    if (!row) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    return NextResponse.json(mapTreinoCorridaRow(row));
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao buscar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const existente = await prisma.treinoCorrida.findFirst({
      where: { id, professorId: session.user.id },
      select: { id: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;

    const data: {
      titulo?: string;
      data?: Date;
      observacao?: string | null;
      status?: string;
      estrutura?: ReturnType<typeof parseEstruturaCorrida>;
    } = {};

    if (typeof b.titulo === "string" && b.titulo.trim()) {
      data.titulo = b.titulo.trim();
    }
    if (typeof b.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.data.trim())) {
      data.data = new Date(`${b.data.trim()}T12:00:00.000Z`);
    }
    if (b.observacao === null || typeof b.observacao === "string") {
      data.observacao =
        typeof b.observacao === "string" ? b.observacao.trim() || null : null;
    }
    if (typeof b.status === "string" && isStatusTreinoCorrida(b.status)) {
      data.status = b.status;
    }
    if (b.estrutura !== undefined) {
      const estrutura = parseEstruturaCorrida(b.estrutura);
      const erro = validarEstrutura(estrutura);
      if (erro) {
        return NextResponse.json({ error: erro }, { status: 400 });
      }
      data.estrutura = estrutura;
    }

    const row = await prisma.treinoCorrida.update({
      where: { id },
      data,
      include: { aluno: { select: { nomeCompleto: true } } },
    });

    return NextResponse.json(mapTreinoCorridaRow(row));
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao atualizar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const existente = await prisma.treinoCorrida.findFirst({
      where: { id, professorId: session.user.id },
      select: { id: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    await prisma.treinoCorrida.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao excluir treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
