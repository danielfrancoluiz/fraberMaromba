/** URLs e helpers client-safe (sem Prisma). */
export const FORMULARIO_NUTRICAO_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdtlJsrjEOMmIrqNbjzEQztI2PD4Q18awk5kG1Tg6OnoJWnyA/viewform?embedded=true";

export const FORMULARIO_NUTRICAO_URL_ABRIR =
  "https://docs.google.com/forms/d/e/1FAIpQLSdtlJsrjEOMmIrqNbjzEQztI2PD4Q18awk5kG1Tg6OnoJWnyA/viewform";

export function formatarPrecoCentavos(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}
