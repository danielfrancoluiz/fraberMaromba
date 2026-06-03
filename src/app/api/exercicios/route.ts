import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizarGrupoMuscular } from "@/lib/grupos-musculares";

const LIMITE_MAX = 50;
const LIMITE_PADRAO = 20;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = req.nextUrl.searchParams;
    const busca = params.get("busca")?.trim() ?? "";
    const grupoParam = params.get("grupo")?.trim() ?? "";
    const pagina = Math.max(1, Number.parseInt(params.get("pagina") ?? "1", 10) || 1);
    const limiteRaw = Number.parseInt(params.get("limite") ?? String(LIMITE_PADRAO), 10);
    const limite = Math.min(
      LIMITE_MAX,
      Math.max(1, Number.isNaN(limiteRaw) ? LIMITE_PADRAO : limiteRaw)
    );
    const skip = (pagina - 1) * limite;

    const grupo = grupoParam ? normalizarGrupoMuscular(grupoParam) : "";

    const where = {
      ativo: true,
      ...(grupo ? { grupoMuscular: grupo } : {}),
      ...(busca
        ? {
            nome: {
              contains: busca,
              mode: "insensitive" as const,
            },
          }
        : {}),
    };

    const [itens, total] = await Promise.all([
      prisma.exercicioCatalogo.findMany({
        where,
        orderBy: [{ grupoMuscular: "asc" }, { nome: "asc" }],
        skip,
        take: limite,
      }),
      prisma.exercicioCatalogo.count({ where }),
    ]);

    return NextResponse.json({
      itens,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite) || 1,
      },
    });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar exercícios";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
