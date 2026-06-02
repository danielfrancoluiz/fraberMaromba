import { NextRequest, NextResponse } from "next/server";
import { requireAlunoSession } from "@/lib/get-api-session";
import type { Treino, Exercicio } from "@prisma/client";
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

type DiaSemana = (typeof ORDEM_DIAS)[number];

type TreinoComExercicios = Treino & { exercicios: Exercicio[] };

type TreinosPorDia = Record<DiaSemana, TreinoComExercicios[]>;

function criarTreinosPorDiaVazio(): TreinosPorDia {
  return {
    segunda: [],
    terca: [],
    quarta: [],
    quinta: [],
    sexta: [],
    sabado: [],
    domingo: [],
  };
}

function isDiaSemana(value: string): value is DiaSemana {
  return ORDEM_DIAS.includes(value as DiaSemana);
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAlunoSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const aluno = await prisma.aluno.findFirst({
      where: {
        OR: [{ usuarioId: session.user.id }, { id: session.user.id }],
      },
    });

    if (!aluno) {
      return NextResponse.json(criarTreinosPorDiaVazio());
    }

    const treinos = await prisma.treino.findMany({
      where: { alunoId: aluno.id },
      include: {
        exercicios: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    const agrupado = criarTreinosPorDiaVazio();

    for (const treino of treinos) {
      if (isDiaSemana(treino.diaSemana)) {
        agrupado[treino.diaSemana].push(treino);
      }
    }

    return NextResponse.json(agrupado);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar treinos";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
