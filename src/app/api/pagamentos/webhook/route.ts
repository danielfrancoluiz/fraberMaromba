import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { isPlanoPagamentoId } from "@/lib/planos-pagamento";

async function ativarAlunoAposPagamento(
  alunoId: string,
  planoId: string | undefined
): Promise<void> {
  const aluno = await prisma.aluno.findUnique({
    where: { id: alunoId },
    select: { usuarioId: true, id: true },
  });

  if (!aluno) return;

  await prisma.aluno.update({
    where: { id: alunoId },
    data: {
      status: "ativo_plataforma",
      ...(planoId && isPlanoPagamentoId(planoId) ? { planoId } : {}),
    },
  });

  const usuarioId = aluno.usuarioId ?? aluno.id;
  await prisma.usuario.updateMany({
    where: { id: usuarioId },
    data: { status: "ativo_plataforma" },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const pagamentoId =
        session.metadata?.pagamentoId ?? session.client_reference_id ?? null;
      const alunoId = session.metadata?.alunoId;
      const planoId = session.metadata?.planoId;

      if (session.id) {
        await prisma.pagamento.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: "pago", dataPagamento: new Date() },
        });
      }

      if (pagamentoId) {
        const pagamento = await prisma.pagamento.update({
          where: { id: pagamentoId },
          data: {
            status: "pago",
            dataPagamento: new Date(),
            ...(session.id ? { stripeSessionId: session.id } : {}),
          },
        });

        await ativarAlunoAposPagamento(
          pagamento.alunoId,
          planoId ?? pagamento.planoId
        );
      } else if (alunoId) {
        await prisma.pagamento.updateMany({
          where: {
            alunoId,
            status: "pendente",
            stripeSessionId: session.id,
          },
          data: { status: "pago", dataPagamento: new Date() },
        });
        await ativarAlunoAposPagamento(alunoId, planoId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

export const runtime = "nodejs";
