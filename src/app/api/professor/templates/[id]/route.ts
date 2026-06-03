import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import {
  isExercicioInputPayload,
  mapExercicioCreateInput,
  type ExercicioInputPayload,
} from "@/lib/exercicio-input";

interface AtualizarTemplateBody {
  nome?: string;
  descricao?: string;
  exercicios?: ExercicioInputPayload[];
}

const exercicioInclude = {
  orderBy: { ordem: "asc" as const },
  include: { catalogo: true },
};

function isAtualizarTemplateBody(value: unknown): value is AtualizarTemplateBody {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  if (dados.nome !== undefined && typeof dados.nome !== "string") return false;
  if (dados.descricao !== undefined && typeof dados.descricao !== "string") return false;
  if (dados.exercicios !== undefined) {
    if (!Array.isArray(dados.exercicios)) return false;
    if (!dados.exercicios.every(isExercicioInputPayload)) return false;
  }
  return true;
}

async function buscarTemplateDoProfessor(id: string, professorId: string) {
  return prisma.treinoTemplate.findFirst({
    where: { id, professorId },
    include: { exercicios: exercicioInclude },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body: unknown = await req.json();

    if (!isAtualizarTemplateBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const existente = await buscarTemplateDoProfessor(id, session.user.id);
    if (!existente) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }

    const template = await prisma.$transaction(async (tx) => {
      if (body.exercicios) {
        await tx.exercicioTemplate.deleteMany({ where: { templateId: id } });
        await tx.exercicioTemplate.createMany({
          data: body.exercicios.map((exercicio, index) => ({
            templateId: id,
            ...mapExercicioCreateInput(exercicio, index),
          })),
        });
      }

      return tx.treinoTemplate.update({
        where: { id },
        data: {
          ...(body.nome !== undefined ? { nome: body.nome.trim() } : {}),
          ...(body.descricao !== undefined ? { descricao: body.descricao.trim() || null } : {}),
        },
        include: {
          exercicios: exercicioInclude,
        },
      });
    });

    return NextResponse.json(template);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao atualizar template";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existente = await buscarTemplateDoProfessor(id, session.user.id);

    if (!existente) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }

    await prisma.treinoTemplate.delete({ where: { id } });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao excluir template";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
