import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  isExercicioInputPayload,
  mapExercicioCreateInput,
  type ExercicioInputPayload,
} from "@/lib/exercicio-input";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface AtualizarTreinoBody {
  nome?: string;
  descricao?: string;
  objetivo?: string;
  diaSemana?: string;
  alunoId?: string;
  exercicios?: ExercicioInputPayload[];
}

const exercicioInclude = {
  orderBy: { ordem: "asc" as const },
  include: { catalogo: true },
};

function isAtualizarTreinoBody(value: unknown): value is AtualizarTreinoBody {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  if (dados.nome !== undefined && typeof dados.nome !== "string") return false;
  if (dados.descricao !== undefined && typeof dados.descricao !== "string") return false;
  if (dados.objetivo !== undefined && typeof dados.objetivo !== "string") return false;
  if (dados.diaSemana !== undefined && typeof dados.diaSemana !== "string") return false;
  if (dados.alunoId !== undefined && typeof dados.alunoId !== "string") return false;
  if (dados.exercicios !== undefined) {
    if (!Array.isArray(dados.exercicios)) return false;
    if (!dados.exercicios.every(isExercicioInputPayload)) return false;
  }
  return true;
}

async function buscarTreinoDoProfessor(id: string, professorId: string) {
  return prisma.treino.findFirst({
    where: { id, professorId },
    include: { exercicios: exercicioInclude },
  });
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireProfessorSession(_req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const treino = await buscarTreinoDoProfessor(id, session.user.id);

    if (!treino) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    return NextResponse.json(treino);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao buscar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const body: unknown = await req.json();

    if (!isAtualizarTreinoBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const existente = await buscarTreinoDoProfessor(id, session.user.id);
    if (!existente) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    if (body.alunoId) {
      const aluno = await prisma.aluno.findFirst({
        where: { id: body.alunoId, professorId: session.user.id },
      });
      if (!aluno) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
    }

    const treino = await prisma.$transaction(async (tx) => {
      if (body.exercicios) {
        await tx.exercicio.deleteMany({ where: { treinoId: id } });
        await tx.exercicio.createMany({
          data: body.exercicios.map((exercicio, index) => ({
            treinoId: id,
            ...mapExercicioCreateInput(exercicio, index),
          })),
        });
      }

      return tx.treino.update({
        where: { id },
        data: {
          ...(body.nome !== undefined ? { nome: body.nome.trim() } : {}),
          ...(body.descricao !== undefined
            ? { descricao: body.descricao.trim() || null }
            : {}),
          ...(body.objetivo !== undefined
            ? { objetivo: body.objetivo.trim() || null }
            : {}),
          ...(body.diaSemana !== undefined ? { diaSemana: body.diaSemana } : {}),
          ...(body.alunoId !== undefined ? { alunoId: body.alunoId } : {}),
        },
        include: { exercicios: exercicioInclude },
      });
    });

    return NextResponse.json(treino);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao atualizar treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireProfessorSession(_req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const existente = await buscarTreinoDoProfessor(id, session.user.id);

    if (!existente) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    await prisma.treino.delete({ where: { id } });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao excluir treino";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
