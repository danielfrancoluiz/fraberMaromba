import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { resolveAlunoId } from "@/lib/sessao-treino-server";
import {
  menorVencimentoVigente,
  modulosVigentes,
  normalizarModulos,
  parseModulosVencimentos,
} from "@/lib/modulos-aluno";

/** Estado atual de módulos do aluno no banco (para sincronizar JWT). */
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

    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      select: {
        planoId: true,
        planoVenceEm: true,
        modulosAtivos: true,
        modulosVencimentos: true,
        status: true,
      },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    let venc = parseModulosVencimentos(aluno.modulosVencimentos);
    if (Object.keys(venc).length === 0 && aluno.planoVenceEm) {
      for (const id of normalizarModulos(aluno.modulosAtivos)) {
        venc[id] = aluno.planoVenceEm.toISOString();
      }
    }

    const vigentes = modulosVigentes(venc);

    return NextResponse.json({
      alunoId,
      modulosAtivos: vigentes,
      modulosVencimentos: venc,
      planoVenceEm:
        menorVencimentoVigente(venc) ?? aluno.planoVenceEm?.toISOString() ?? null,
      planoId: aluno.planoId || null,
      status: aluno.status,
    });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao carregar acesso";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
