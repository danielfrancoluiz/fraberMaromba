import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import {
  buscarExercicioDoProfessor,
  isExercicioCatalogoPayload,
  mapPayloadParaDados,
  validarExercicioCatalogo,
} from "@/lib/exercicio-catalogo-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const exercicio = await buscarExercicioDoProfessor(id, session.user.id);
    if (!exercicio) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    return NextResponse.json(exercicio);
  } catch (error) {
    console.error("[GET /api/professor/exercicios/[id]]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
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
    const existente = await buscarExercicioDoProfessor(id, session.user.id);
    if (!existente) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    const body: unknown = await req.json();
    if (!isExercicioCatalogoPayload(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const erroValidacao = validarExercicioCatalogo(body);
    if (erroValidacao) {
      return NextResponse.json({ error: erroValidacao }, { status: 400 });
    }

    const exercicio = await prisma.exercicioCatalogo.update({
      where: { id },
      data: mapPayloadParaDados(body),
    });

    return NextResponse.json(exercicio);
  } catch (error) {
    console.error("[PATCH /api/professor/exercicios/[id]]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
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
    const existente = await buscarExercicioDoProfessor(id, session.user.id);
    if (!existente) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    await prisma.exercicioCatalogo.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/professor/exercicios/[id]]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
