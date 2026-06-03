import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";

interface ExercicioTemplateInput {
  nome: string;
  series: number;
  repeticoes: number;
  grupoMuscular?: string;
  observacao?: string;
  ordem?: number;
}

interface AtualizarTemplateBody {
  nome?: string;
  descricao?: string;
  exercicios?: ExercicioTemplateInput[];
}

function isExercicioTemplateInput(value: unknown): value is ExercicioTemplateInput {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.nome === "string" &&
    typeof dados.series === "number" &&
    typeof dados.repeticoes === "number"
  );
}

function isAtualizarTemplateBody(value: unknown): value is AtualizarTemplateBody {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  if (dados.nome !== undefined && typeof dados.nome !== "string") return false;
  if (dados.descricao !== undefined && typeof dados.descricao !== "string") return false;
  if (dados.exercicios !== undefined) {
    if (!Array.isArray(dados.exercicios)) return false;
    if (!dados.exercicios.every(isExercicioTemplateInput)) return false;
  }
  return true;
}

async function buscarTemplateDoProfessor(id: string, professorId: string) {
  return prisma.treinoTemplate.findFirst({
    where: { id, professorId },
    include: { exercicios: { orderBy: { ordem: "asc" } } },
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
            nome: exercicio.nome,
            series: exercicio.series,
            repeticoes: exercicio.repeticoes,
            grupoMuscular: exercicio.grupoMuscular,
            observacao: exercicio.observacao,
            ordem: exercicio.ordem ?? index + 1,
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
          exercicios: { orderBy: { ordem: "asc" } },
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
