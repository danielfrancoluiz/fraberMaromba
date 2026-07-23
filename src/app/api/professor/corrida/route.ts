import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { assertAlunoDoProfessor } from "@/lib/sessao-treino-server";
import {
  dataISOFromDb,
  isStatusTreinoCorrida,
  parseEstruturaCorrida,
  validarEstrutura,
  type TreinoCorridaDTO,
} from "@/lib/treino-corrida";

function toDTO(
  row: {
    id: string;
    alunoId: string;
    professorId: string;
    titulo: string;
    data: Date;
    observacao: string | null;
    status: string;
    estrutura: unknown;
    criadoEm: Date;
    atualizadoEm: Date;
    aluno?: { nomeCompleto: string } | null;
  }
): TreinoCorridaDTO {
  return {
    id: row.id,
    alunoId: row.alunoId,
    professorId: row.professorId,
    titulo: row.titulo,
    data: dataISOFromDb(row.data),
    observacao: row.observacao,
    status: isStatusTreinoCorrida(row.status) ? row.status : "planejado",
    estrutura: parseEstruturaCorrida(row.estrutura),
    criadoEm: row.criadoEm.toISOString(),
    atualizadoEm: row.atualizadoEm.toISOString(),
    alunoNome: row.aluno?.nomeCompleto,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = req.nextUrl.searchParams.get("alunoId")?.trim();
    const de = req.nextUrl.searchParams.get("de")?.trim();
    const ate = req.nextUrl.searchParams.get("ate")?.trim();

    if (alunoId) {
      const ok = await assertAlunoDoProfessor(alunoId, session.user.id);
      if (!ok) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
    }

    const where: {
      professorId: string;
      alunoId?: string;
      data?: { gte?: Date; lte?: Date };
    } = { professorId: session.user.id };

    if (alunoId) where.alunoId = alunoId;
    if (de || ate) {
      where.data = {};
      if (de) where.data.gte = new Date(`${de}T00:00:00.000Z`);
      if (ate) where.data.lte = new Date(`${ate}T00:00:00.000Z`);
    }

    const rows = await prisma.treinoCorrida.findMany({
      where,
      include: { aluno: { select: { nomeCompleto: true } } },
      orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
      take: 60,
    });

    return NextResponse.json(rows.map(toDTO));
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar treinos de corrida";
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
    const alunoId = typeof b.alunoId === "string" ? b.alunoId.trim() : "";
    const titulo = typeof b.titulo === "string" ? b.titulo.trim() : "";
    const dataStr = typeof b.data === "string" ? b.data.trim() : "";
    const observacao =
      typeof b.observacao === "string" ? b.observacao.trim() || null : null;
    const estrutura = parseEstruturaCorrida(b.estrutura);

    if (!alunoId || !titulo || !/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      return NextResponse.json(
        { error: "Informe aluno, título e data (AAAA-MM-DD)." },
        { status: 400 }
      );
    }

    const erroEstrutura = validarEstrutura(estrutura);
    if (erroEstrutura) {
      return NextResponse.json({ error: erroEstrutura }, { status: 400 });
    }

    const ok = await assertAlunoDoProfessor(alunoId, session.user.id);
    if (!ok) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const row = await prisma.treinoCorrida.create({
      data: {
        alunoId,
        professorId: session.user.id,
        titulo,
        data: new Date(`${dataStr}T12:00:00.000Z`),
        observacao,
        estrutura,
        status: "planejado",
      },
      include: { aluno: { select: { nomeCompleto: true } } },
    });

    return NextResponse.json(toDTO(row), { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao criar treino de corrida";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
