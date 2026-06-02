import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

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
        exercicios: {
          orderBy: { ordem: "asc" },
        },
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

interface ExercicioInput {
  nome: string;
  series: number;
  repeticoes: number;
  grupoMuscular?: string;
  observacao?: string;
  ordem?: number;
}

interface CriarTreinoBody {
  alunoId: string;
  nome: string;
  diaSemana: string;
  exercicios: ExercicioInput[];
}

function isExercicioInput(value: unknown): value is ExercicioInput {
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

  return dados.exercicios.every(isExercicioInput);
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
        nome: body.nome,
        diaSemana: body.diaSemana,
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

    return NextResponse.json(treino, { status: 201 });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao criar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
