import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { slugExercicioUnico } from "@/lib/slug-exercicio";
import {
  isExercicioCatalogoPayload,
  mapPayloadParaDados,
  validarExercicioCatalogo,
} from "@/lib/exercicio-catalogo-api";

export async function GET(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const busca = req.nextUrl.searchParams.get("busca")?.trim() ?? "";

    const itens = await prisma.exercicioCatalogo.findMany({
      where: {
        professorId: session.user.id,
        ativo: true,
        ...(busca
          ? {
              nome: {
                contains: busca,
                mode: "insensitive" as const,
              },
            }
          : {}),
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json({ itens });
  } catch (error) {
    console.error("[GET /api/professor/exercicios]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isExercicioCatalogoPayload(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const erroValidacao = validarExercicioCatalogo(body);
    if (erroValidacao) {
      return NextResponse.json({ error: erroValidacao }, { status: 400 });
    }

    const exercicio = await prisma.exercicioCatalogo.create({
      data: {
        professorId: session.user.id,
        slug: slugExercicioUnico(body.nome.trim()),
        ...mapPayloadParaDados(body),
      },
    });

    return NextResponse.json(exercicio, { status: 201 });
  } catch (error) {
    console.error("[POST /api/professor/exercicios]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
