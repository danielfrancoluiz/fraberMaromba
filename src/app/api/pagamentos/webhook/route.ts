import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      await prisma.pagamento.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "pago", dataPagamento: new Date() },
      });
      if (session.metadata?.alunoId) {
        await prisma.aluno.update({
          where: { id: session.metadata.alunoId },
          data: { status: "ativo_plataforma" },
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

export const config = { api: { bodyParser: false } };
