import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const templates = await prisma.treinoTemplate.findMany({
      where: { professorId: session.user.id },
      include: {
        exercicios: {
          orderBy: { ordem: "asc" },
        },
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

interface ExercicioTemplateInput {
  nome: string;
  series: number;
  repeticoes: number;
  grupoMuscular?: string;
  observacao?: string;
  ordem?: number;
}

interface CriarTemplateBody {
  nome: string;
  descricao?: string;
  exercicios: ExercicioTemplateInput[];
}

function isExercicioTemplateInput(value: unknown): value is ExercicioTemplateInput {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  return (
    typeof dados.nome === "string" &&
    typeof dados.series === "number" &&
    typeof dados.repeticoes === "number" &&
    (dados.grupoMuscular === undefined || typeof dados.grupoMuscular === "string") &&
    (dados.observacao === undefined || typeof dados.observacao === "string") &&
    (dados.ordem === undefined || typeof dados.ordem === "number")
  );
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

  return dados.exercicios.every(isExercicioTemplateInput);
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
          create: body.exercicios.map((exercicio, index) => ({
            nome: exercicio.nome,
            series: exercicio.series,
            repeticoes: exercicio.repeticoes,
            grupoMuscular: exercicio.grupoMuscular,
            observacao: exercicio.observacao,
            ordem: exercicio.ordem ?? index + 1,
          })),
        },
      },
      include: {
        exercicios: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao criar template";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
