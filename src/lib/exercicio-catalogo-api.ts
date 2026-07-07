import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { normalizarGrupoMuscular } from "@/lib/grupos-musculares";
import { subGruposDoMembro } from "@/lib/sub-grupos-musculares";
import {
  isExercicioCatalogoPayload,
  type ExercicioCatalogoPayload,
} from "@/lib/exercicio-catalogo-payload";

export function validarExercicioCatalogo(body: ExercicioCatalogoPayload): string | null {
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

export function mapPayloadParaDados(body: ExercicioCatalogoPayload) {
  const grupoMuscular = normalizarGrupoMuscular(body.grupoMuscular);
  const gifUrl = body.gifUrl?.trim() || null;
  return {
    nome: body.nome.trim(),
    grupoMuscular,
    subGrupoMuscular: body.subGrupoMuscular.trim() || null,
    gifUrl,
    imagemUrl: gifUrl,
    seriesPadrao: body.series,
    repeticoesPadrao: body.repeticoes,
    descansoPadrao: body.descanso,
    unilateral: body.unilateral,
  };
}

export async function buscarExercicioDoProfessor(id: string, professorId: string) {
  return prisma.exercicioCatalogo.findFirst({
    where: { id, professorId, ativo: true },
  });
}

export { isExercicioCatalogoPayload };
