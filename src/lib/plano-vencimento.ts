import { prisma } from "@/lib/prisma";

const CONFIG_ID = "default";
const DIAS_AVISO_PADRAO = 5;

export async function ensureConfigApp(): Promise<void> {
  await prisma.configApp.upsert({
    where: { id: CONFIG_ID },
    create: {
      id: CONFIG_ID,
      diasAvisoVencimento: DIAS_AVISO_PADRAO,
    },
    update: {},
  });
}

export async function getDiasAvisoVencimento(): Promise<number> {
  await ensureConfigApp();
  const config = await prisma.configApp.findUnique({
    where: { id: CONFIG_ID },
    select: { diasAvisoVencimento: true },
  });
  const dias = config?.diasAvisoVencimento ?? DIAS_AVISO_PADRAO;
  return Math.max(1, dias);
}

/** Dias restantes até o vencimento (0 = vence hoje; negativo = vencido). */
export function diasRestantesPlano(
  planoVenceEm?: string | Date | null
): number | null {
  if (!planoVenceEm) return null;
  const fim = new Date(planoVenceEm);
  if (Number.isNaN(fim.getTime())) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  fim.setHours(0, 0, 0, 0);

  const diffMs = fim.getTime() - hoje.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function deveMostrarAvisoVencimento(
  planoVenceEm: string | Date | null | undefined,
  diasAviso: number
): boolean {
  const dias = diasRestantesPlano(planoVenceEm);
  if (dias === null) return false;
  return dias >= 0 && dias <= diasAviso;
}

export function planoVencido(
  planoVenceEm: string | Date | null | undefined
): boolean {
  const dias = diasRestantesPlano(planoVenceEm);
  return dias !== null && dias < 0;
}
