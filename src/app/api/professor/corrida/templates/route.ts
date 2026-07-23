import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  parseEstruturaCorrida,
  validarEstrutura,
  type TreinoCorridaTemplateDTO,
} from "@/lib/treino-corrida";

function toDTO(row: {
  id: string;
  professorId: string;
  nome: string;
  descricao: string | null;
  estrutura: unknown;
  criadoEm: Date;
  atualizadoEm: Date;
}): TreinoCorridaTemplateDTO {
  return {
    id: row.id,
    professorId: row.professorId,
    nome: row.nome,
    descricao: row.descricao,
    estrutura: parseEstruturaCorrida(row.estrutura),
    criadoEm: row.criadoEm.toISOString(),
    atualizadoEm: row.atualizadoEm.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rows = await prisma.treinoCorridaTemplate.findMany({
      where: { professorId: session.user.id },
      orderBy: { atualizadoEm: "desc" },
      take: 50,
    });

    return NextResponse.json(rows.map(toDTO));
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar templates";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const nome = typeof b.nome === "string" ? b.nome.trim() : "";
    const descricao =
      typeof b.descricao === "string" ? b.descricao.trim() || null : null;
    const estrutura = parseEstruturaCorrida(b.estrutura);

    if (!nome) {
      return NextResponse.json({ error: "Informe o nome do template." }, { status: 400 });
    }
    const erro = validarEstrutura(estrutura);
    if (erro) {
      return NextResponse.json({ error: erro }, { status: 400 });
    }

    const row = await prisma.treinoCorridaTemplate.create({
      data: {
        professorId: session.user.id,
        nome,
        descricao,
        estrutura,
      },
    });

    return NextResponse.json(toDTO(row), { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao criar template";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
