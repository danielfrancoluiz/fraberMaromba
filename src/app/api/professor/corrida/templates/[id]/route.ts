import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

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
    const existente = await prisma.treinoCorridaTemplate.findFirst({
      where: { id, professorId: session.user.id },
      select: { id: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }

    await prisma.treinoCorridaTemplate.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao excluir template";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
