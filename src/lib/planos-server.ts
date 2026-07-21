import type { Plano } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLANOS_SEED } from "@/lib/planos-seed";

export type PlanoRegistro = Plano;

export function formatarPrecoCentavos(centavos: number): string {
  if (centavos <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

export function calcularDataVencimentoPorDias(
  diasValidade: number,
  base = new Date()
): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.max(1, diasValidade));
  return d;
}

/** Garante que a tabela Plano tenha os planos padrão (produção sem re-seed). */
export async function ensurePlanosSeeded(): Promise<void> {
  const count = await prisma.plano.count();
  if (count > 0) return;

  await prisma.plano.createMany({
    data: PLANOS_SEED.map((p) => ({ ...p })),
    skipDuplicates: true,
  });
}

export async function listarPlanos(options?: {
  apenasAtivos?: boolean;
  apenasCheckout?: boolean;
}): Promise<Plano[]> {
  await ensurePlanosSeeded();

  return prisma.plano.findMany({
    where: {
      ...(options?.apenasAtivos ? { ativo: true } : {}),
      ...(options?.apenasCheckout ? { permiteCheckout: true, ativo: true } : {}),
    },
    orderBy: { ordem: "asc" },
  });
}

export async function buscarPlanoPorId(id: string): Promise<Plano | null> {
  await ensurePlanosSeeded();
  return prisma.plano.findUnique({ where: { id } });
}

export function planoParaOpcaoCheckout(plano: Plano) {
  return {
    id: plano.id,
    nome: plano.nome,
    preco: formatarPrecoCentavos(plano.valorCentavos),
    valorCentavos: plano.valorCentavos,
    diasValidade: plano.diasValidade,
    permiteCheckout: plano.permiteCheckout,
    ativo: plano.ativo,
  };
}
