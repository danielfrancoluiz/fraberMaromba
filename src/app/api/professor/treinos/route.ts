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

const ORDEM_DIAS = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = req.nextUrl.searchParams.get("alunoId");

    const treinos = await prisma.treino.findMany({
      where: {
        professorId: session.user.id,
        ...(alunoId ? { alunoId } : {}),
      },
      include: {
        exercicios: exercicioInclude,
        aluno: { select: { id: true, nomeCompleto: true } },
      },
      orderBy: { dataCriacao: "desc" },
    });

    if (alunoId) {
      const ordemMap = new Map(ORDEM_DIAS.map((dia, index) => [dia, index]));
      treinos.sort(
        (a, b) =>
          (ordemMap.get(a.diaSemana as (typeof ORDEM_DIAS)[number]) ?? 99) -
          (ordemMap.get(b.diaSemana as (typeof ORDEM_DIAS)[number]) ?? 99)
      );
    }

    return NextResponse.json(treinos);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar treinos";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

interface CriarTreinoBody {
  alunoId: string;
  nome: string;
  descricao?: string;
  objetivo?: string;
  diaSemana: string;
  exercicios: ExercicioInputPayload[];
}

function isCriarTreinoBody(value: unknown): value is CriarTreinoBody {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  if (
    typeof dados.alunoId !== "string" ||
    typeof dados.nome !== "string" ||
    typeof dados.diaSemana !== "string" ||
    !Array.isArray(dados.exercicios)
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
    if (!isCriarTreinoBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const aluno = await prisma.aluno.findFirst({
      where: { id: body.alunoId, professorId: session.user.id },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const treino = await prisma.treino.create({
      data: {
        alunoId: body.alunoId,
        professorId: session.user.id,
        nome: body.nome.trim(),
        descricao: body.descricao?.trim() || null,
        objetivo: body.objetivo?.trim() || null,
        diaSemana: body.diaSemana,
        exercicios: {
          create: body.exercicios.map(mapExercicioCreateInput),
        },
      },
      include: {
        exercicios: exercicioInclude,
      },
    });

    return NextResponse.json(treino, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao criar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
