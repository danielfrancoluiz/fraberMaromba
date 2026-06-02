import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const PLANOS_STRIPE = {
  mensal: { nome: "Plano Mensal", valor: 9990 },
  semestral: { nome: "Plano Semestral", valor: 49990 },
  anual: { nome: "Plano Anual", valor: 89990 },
  avulso: { nome: "Aula Avulsa", valor: 2990 },
  gympass: { nome: "Gympass", valor: 0 },
} as const;
