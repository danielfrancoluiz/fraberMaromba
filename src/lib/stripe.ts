import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY não configurado. Verifique as variáveis de ambiente."
    );
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia",
  });
}

function getStripeClient(): Stripe {
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = createStripeClient();
  }
  return globalForStripe.stripe;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, property, receiver) {
    const client = getStripeClient();
    return Reflect.get(client, property, receiver);
  },
});

export const PLANOS_STRIPE = {
  mensal: { nome: "Plano Mensal", valor: 9990 },
  semestral: { nome: "Plano Semestral", valor: 49990 },
  anual: { nome: "Plano Anual", valor: 89990 },
  avulso: { nome: "Aula Avulsa", valor: 2990 },
  gympass: { nome: "Gympass", valor: 0 },
} as const;
