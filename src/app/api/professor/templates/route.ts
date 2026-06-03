import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  isExercicioInputPayload,
  mapExercicioCreateInput,
  type ExercicioInputPayload,
} from "@/lib/exercicio-input";

const exercicioInclude = {
  orderBy: { ordem: "asc" as const },
  include: { catalogo: true },
};

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const templates = await prisma.treinoTemplate.findMany({
      where: { professorId: session.user.id },
      include: {
        exercicios: exercicioInclude,
      },
      orderBy: { dataCriacao: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar templates";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

interface CriarTemplateBody {
  nome: string;
  descricao?: string;
  exercicios: ExercicioInputPayload[];
}

function isCriarTemplateBody(value: unknown): value is CriarTemplateBody {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  if (
    typeof dados.nome !== "string" ||
    !Array.isArray(dados.exercicios) ||
    (dados.descricao !== undefined && typeof dados.descricao !== "string")
  ) {
    return false;
  }

  return dados.exercicios.every(isExercicioInputPayload);
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isCriarTemplateBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const template = await prisma.treinoTemplate.create({
      data: {
        professorId: session.user.id,
        nome: body.nome,
        descricao: body.descricao,
        exercicios: {
          create: body.exercicios.map(mapExercicioCreateInput),
        },
      },
      include: {
        exercicios: exercicioInclude,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao criar template";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
