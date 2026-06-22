import { PLANOS_STRIPE } from "@/lib/stripe";

export type PlanoPagamentoId = keyof typeof PLANOS_STRIPE;

export const PLANOS_LABEL: Record<string, string> = {
  mensal: "Mensal",
  semestral: "Semestral",
  anual: "Anual",
  avulso: "Avulso",
  gympass: "Gympass",
};

function formatarPrecoBRL(centavos: number): string {
  if (centavos <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

export const PLANOS_PRECO_LABEL: Record<PlanoPagamentoId, string> = Object.fromEntries(
  (Object.keys(PLANOS_STRIPE) as PlanoPagamentoId[]).map((id) => [
    id,
    formatarPrecoBRL(PLANOS_STRIPE[id].valor),
  ])
) as Record<PlanoPagamentoId, string>;

const PAYMENT_LINK_ENV: Record<PlanoPagamentoId, string> = {
  mensal: "NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MENSAL",
  semestral: "NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SEMESTRAL",
  anual: "NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ANUAL",
  avulso: "NEXT_PUBLIC_STRIPE_PAYMENT_LINK_AVULSO",
  gympass: "NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MENSAL",
};

export function isPlanoPagamentoId(value: string): value is PlanoPagamentoId {
  return value in PLANOS_STRIPE;
}

export function valorPlanoReais(planoId: PlanoPagamentoId): number {
  return PLANOS_STRIPE[planoId].valor / 100;
}

export function valorPlanoCentavos(planoId: PlanoPagamentoId): number {
  return PLANOS_STRIPE[planoId].valor;
}

export function getStripePaymentLink(planoId: PlanoPagamentoId): string | null {
  const envKey = PAYMENT_LINK_ENV[planoId];
  const link = process.env[envKey]?.trim();
  return link || null;
}

/** Vencimento estimado conforme o plano contratado */
export function calcularDataVencimento(planoId: PlanoPagamentoId, base = new Date()): Date {
  const d = new Date(base);
  switch (planoId) {
    case "semestral":
      d.setMonth(d.getMonth() + 6);
      break;
    case "anual":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "avulso":
      d.setDate(d.getDate() + 1);
      break;
    case "gympass":
      d.setMonth(d.getMonth() + 1);
      break;
    case "mensal":
    default:
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d;
}

export const PLANOS_CHECKOUT: { id: PlanoPagamentoId; nome: string; preco: string }[] = [
  { id: "mensal", nome: "Mensal", preco: PLANOS_PRECO_LABEL.mensal },
  { id: "semestral", nome: "Semestral", preco: PLANOS_PRECO_LABEL.semestral },
  { id: "anual", nome: "Anual", preco: PLANOS_PRECO_LABEL.anual },
  { id: "avulso", nome: "Avulso", preco: PLANOS_PRECO_LABEL.avulso },
];
