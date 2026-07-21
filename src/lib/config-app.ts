import { prisma } from "@/lib/prisma";

const CONFIG_ID = "default";
const DIAS_AVISO_PADRAO = 5;

/** Lê no banco quantos dias antes do vencimento mostrar o aviso no dashboard. */
export async function getDiasAvisoVencimento(): Promise<number> {
  await prisma.configApp.upsert({
    where: { id: CONFIG_ID },
    create: {
      id: CONFIG_ID,
      diasAvisoVencimento: DIAS_AVISO_PADRAO,
    },
    update: {},
  });

  const config = await prisma.configApp.findUnique({
    where: { id: CONFIG_ID },
    select: { diasAvisoVencimento: true },
  });

  return Math.max(1, config?.diasAvisoVencimento ?? DIAS_AVISO_PADRAO);
}
