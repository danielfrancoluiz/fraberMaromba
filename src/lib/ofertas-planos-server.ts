import { prisma } from "@/lib/prisma";
import {
  OFERTAS_PLANOS_PADRAO,
  type OfertaGrupo,
  type OfertaPlanoSeed,
} from "../../prisma/data/ofertas-planos";

export type OfertaPlanoDTO = {
  id: string;
  grupo: OfertaGrupo;
  nome: string;
  descricao: string | null;
  valorCentavos: number;
  diasValidade: number;
  modulos: string[];
  ordem: number;
  ativo: boolean;
  badge: string | null;
};

function toDTO(row: {
  id: string;
  grupo: string;
  nome: string;
  descricao: string | null;
  valorCentavos: number;
  diasValidade: number;
  modulos: string[];
  ordem: number;
  ativo: boolean;
  badge: string | null;
}): OfertaPlanoDTO {
  return {
    id: row.id,
    grupo: row.grupo === "nutricao" ? "nutricao" : "treino",
    nome: row.nome,
    descricao: row.descricao,
    valorCentavos: row.valorCentavos,
    diasValidade: row.diasValidade,
    modulos: row.modulos,
    ordem: row.ordem,
    ativo: row.ativo,
    badge: row.badge,
  };
}

/** Garante ofertas no banco. Não sobrescreve edições feitas no painel. */
export async function ensureOfertasPlanosSeeded(): Promise<void> {
  for (const o of OFERTAS_PLANOS_PADRAO) {
    await prisma.ofertaPlano.upsert({
      where: { id: o.id },
      create: {
        id: o.id,
        grupo: o.grupo,
        nome: o.nome,
        descricao: o.descricao,
        valorCentavos: o.valorCentavos,
        diasValidade: o.diasValidade,
        modulos: o.modulos,
        ordem: o.ordem,
        ativo: o.ativo,
        badge: o.badge ?? null,
      },
      update: {},
    });
  }
}

export async function listarOfertas(params?: {
  grupo?: OfertaGrupo;
  apenasAtivas?: boolean;
}): Promise<OfertaPlanoDTO[]> {
  await ensureOfertasPlanosSeeded();
  const rows = await prisma.ofertaPlano.findMany({
    where: {
      ...(params?.grupo ? { grupo: params.grupo } : {}),
      ...(params?.apenasAtivas === false ? {} : { ativo: true }),
    },
    orderBy: { ordem: "asc" },
  });
  return rows.map(toDTO);
}

export async function buscarOfertaPorId(
  id: string
): Promise<OfertaPlanoDTO | null> {
  await ensureOfertasPlanosSeeded();
  const row = await prisma.ofertaPlano.findUnique({ where: { id } });
  if (!row || !row.ativo) return null;
  return toDTO(row);
}

export async function atualizarOferta(
  id: string,
  patch: Partial<{
    nome: string;
    descricao: string | null;
    valorCentavos: number;
    diasValidade: number;
    ativo: boolean;
    badge: string | null;
    ordem: number;
  }>
): Promise<OfertaPlanoDTO | null> {
  const existe = await prisma.ofertaPlano.findUnique({ where: { id } });
  if (!existe) return null;
  const row = await prisma.ofertaPlano.update({
    where: { id },
    data: patch,
  });
  return toDTO(row);
}

export function formatarPrecoCentavos(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

export type { OfertaPlanoSeed, OfertaGrupo };
