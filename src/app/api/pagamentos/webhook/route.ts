import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { confirmarPagamentoCheckoutSession } from "@/lib/pagamento-stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 400 });
  }

  if (!webhookSecret.startsWith("whsec_")) {
    console.error(
      "[stripe/webhook] STRIPE_WEBHOOK_SECRET inválido: use o signing secret (whsec_...) do webhook ou do `stripe listen`, não a secret key (sk_) nem restricted key (rk_)."
    );
    return NextResponse.json({ error: "Webhook mal configurado" }, { status: 500 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await confirmarPagamentoCheckoutSession(session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

export const runtime = "nodejs";
