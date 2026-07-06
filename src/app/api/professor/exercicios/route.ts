import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { normalizarGrupoMuscular } from "@/lib/grupos-musculares";
import { subGruposDoMembro } from "@/lib/sub-grupos-musculares";
import { slugExercicioUnico } from "@/lib/slug-exercicio";

interface CriarExercicioBody {
  nome: string;
  gifUrl?: string;
  grupoMuscular: string;
  subGrupoMuscular: string;
  series: number;
  repeticoes: number;
  descanso: number;
}

function isCriarExercicioBody(value: unknown): value is CriarExercicioBody {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.nome === "string" &&
    typeof dados.grupoMuscular === "string" &&
    typeof dados.subGrupoMuscular === "string" &&
    typeof dados.series === "number" &&
    typeof dados.repeticoes === "number" &&
    typeof dados.descanso === "number"
  );
}

function validarCriarExercicio(body: CriarExercicioBody): string | null {
  if (!body.nome.trim()) return "Informe o nome do exercício";
  const grupo = normalizarGrupoMuscular(body.grupoMuscular);
  if (!grupo) return "Selecione o membro (grupo muscular)";
  const subGrupos = subGruposDoMembro(grupo);
  if (subGrupos.length > 0 && !body.subGrupoMuscular.trim()) {
    return "Selecione o sub-membro";
  }
  if (body.series < 1 || body.series > 99) return "Séries deve ser entre 1 e 99";
  if (body.repeticoes < 1 || body.repeticoes > 999) {
    return "Repetições deve ser entre 1 e 999";
  }
  if (body.descanso < 0 || body.descanso > 600) {
    return "Descanso deve ser entre 0 e 600 segundos";
  }
  if (body.gifUrl?.trim()) {
    try {
      const url = new URL(body.gifUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) {
        return "URL do vídeo/GIF inválida";
      }
    } catch {
      return "URL do vídeo/GIF inválida";
    }
  }
  return null;
}

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
    if (!isCriarExercicioBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const erroValidacao = validarCriarExercicio(body);
    if (erroValidacao) {
      return NextResponse.json({ error: erroValidacao }, { status: 400 });
    }

    const grupoMuscular = normalizarGrupoMuscular(body.grupoMuscular);
    const gifUrl = body.gifUrl?.trim() || null;
    const slug = slugExercicioUnico(body.nome.trim());

    const exercicio = await prisma.exercicioCatalogo.create({
      data: {
        professorId: session.user.id,
        nome: body.nome.trim(),
        slug,
        grupoMuscular,
        subGrupoMuscular: body.subGrupoMuscular.trim() || null,
        gifUrl,
        imagemUrl: gifUrl,
        seriesPadrao: body.series,
        repeticoesPadrao: body.repeticoes,
        descansoPadrao: body.descanso,
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
