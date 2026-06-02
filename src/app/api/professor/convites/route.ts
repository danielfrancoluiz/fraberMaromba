import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (token) {
      const convite = await prisma.convite.findUnique({
        where: { token },
      });

      if (!convite) {
        return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
      }

      return NextResponse.json(convite);
    }

    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const convites = await prisma.convite.findMany({
      where: { professorId: session.user.id },
      orderBy: { dataCriacao: "desc" },
    });

    return NextResponse.json(convites);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar convites";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

interface GerarConviteBody {
  email?: string;
}

function extrairEmailConvite(value: unknown): GerarConviteBody | null {
  if (value === undefined || value === null) {
    return {};
  }

  if (typeof value !== "object") return null;

  const dados = value as Record<string, unknown>;

  if (dados.email === undefined) {
    return {};
  }

  if (typeof dados.email !== "string") return null;

  return { email: dados.email };
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => ({}));
    const dados = extrairEmailConvite(body);

    if (!dados) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const convite = await prisma.convite.create({
      data: {
        professorId: session.user.id,
        email: dados.email,
      },
    });

    return NextResponse.json(convite, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao gerar convite";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
