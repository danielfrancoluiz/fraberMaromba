import { prisma } from "@/lib/prisma";
import {
  DIAS_VALIDADE_MODULOS,
  PRECOS_MODULOS_PADRAO,
  type ModuloAlunoId,
} from "@/lib/modulos-aluno";

const PRECOS_SEED = [
  { quantidade: 1, valorCentavos: PRECOS_MODULOS_PADRAO[1], diasValidade: DIAS_VALIDADE_MODULOS },
  { quantidade: 2, valorCentavos: PRECOS_MODULOS_PADRAO[2], diasValidade: DIAS_VALIDADE_MODULOS },
  { quantidade: 3, valorCentavos: PRECOS_MODULOS_PADRAO[3], diasValidade: DIAS_VALIDADE_MODULOS },
] as const;

export async function ensurePrecosModulosSeeded(): Promise<void> {
  for (const p of PRECOS_SEED) {
    await prisma.precoPacoteModulos.upsert({
      where: { quantidade: p.quantidade },
      create: { ...p, ativo: true },
      update: {},
    });
  }
}

export async function buscarPrecoPorQuantidade(quantidade: number) {
  await ensurePrecosModulosSeeded();
  if (quantidade < 1 || quantidade > 3) return null;
  return prisma.precoPacoteModulos.findUnique({
    where: { quantidade },
  });
}

export async function listarPrecosModulos() {
  await ensurePrecosModulosSeeded();
  return prisma.precoPacoteModulos.findMany({
    where: { ativo: true },
    orderBy: { quantidade: "asc" },
  });
}

export type { ModuloAlunoId };
