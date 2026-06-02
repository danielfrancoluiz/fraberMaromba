import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function PATCH(_req: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;

    const convite = await prisma.convite.findUnique({
      where: { token },
    });

    if (!convite) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }

    if (convite.usado) {
      return NextResponse.json(
        { error: "Este link de convite já foi utilizado." },
        { status: 400 }
      );
    }

    const atualizado = await prisma.convite.update({
      where: { token },
      data: { usado: true },
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao marcar convite como usado";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
