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
