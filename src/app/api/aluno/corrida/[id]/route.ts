import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { resolveAlunoId } from "@/lib/sessao-treino-server";
import { mapTreinoCorridaRow } from "@/lib/treino-corrida";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "aluno") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = await resolveAlunoId(session);
    if (!alunoId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const { id } = await ctx.params;
    const existente = await prisma.treinoCorrida.findFirst({
      where: { id, alunoId, status: { not: "cancelado" } },
      select: { id: true, status: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;

    const concluir = b.concluir === true || b.status === "concluido";
    const feedbackTexto =
      typeof b.feedbackTexto === "string" ? b.feedbackTexto.trim().slice(0, 1000) : undefined;
    let feedbackNota: number | undefined;
    if (typeof b.feedbackNota === "number" && Number.isFinite(b.feedbackNota)) {
      const n = Math.round(b.feedbackNota);
      if (n >= 1 && n <= 5) feedbackNota = n;
    }

    if (!concluir && feedbackTexto === undefined && feedbackNota === undefined) {
      return NextResponse.json(
        { error: "Informe conclusão ou feedback." },
        { status: 400 }
      );
    }

    const row = await prisma.treinoCorrida.update({
      where: { id },
      data: {
        ...(concluir
          ? {
              status: "concluido",
              concluidoEm: new Date(),
            }
          : {}),
        ...(feedbackTexto !== undefined ? { feedbackTexto: feedbackTexto || null } : {}),
        ...(feedbackNota !== undefined ? { feedbackNota } : {}),
      },
    });

    return NextResponse.json(mapTreinoCorridaRow(row));
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao atualizar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
