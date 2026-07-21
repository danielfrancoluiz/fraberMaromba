import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  confirmarPagamentoCheckoutSession,
  confirmarPagamentoPaymentIntent,
} from "@/lib/pagamento-stripe";
import { resolveAlunoId } from "@/lib/sessao-treino-server";

async function autorizarPagamento(
  session: NonNullable<Awaited<ReturnType<typeof getApiSession>>>,
  meta: {
    alunoId?: string;
    professorId?: string;
    tipo?: string;
  }
): Promise<boolean> {
  if (session.user.role === "aluno") {
    const meuAlunoId = await resolveAlunoId(session);
    return Boolean(meuAlunoId && meta.alunoId && meuAlunoId === meta.alunoId);
  }

  if (session.user.role === "professor") {
    if (meta.tipo === "professor" || (!meta.alunoId && meta.professorId)) {
      return meta.professorId === session.user.id;
    }
    if (meta.alunoId) {
      const aluno = await prisma.aluno.findFirst({
        where: { id: meta.alunoId, professorId: session.user.id },
        select: { id: true },
      });
      return Boolean(aluno);
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const sessionId =
      typeof body === "object" &&
      body !== null &&
      "sessionId" in body &&
      typeof (body as { sessionId: string }).sessionId === "string"
        ? (body as { sessionId: string }).sessionId.trim()
        : "";
    const paymentIntentId =
      typeof body === "object" &&
      body !== null &&
      "paymentIntentId" in body &&
      typeof (body as { paymentIntentId: string }).paymentIntentId === "string"
        ? (body as { paymentIntentId: string }).paymentIntentId.trim()
        : "";

    if (paymentIntentId.startsWith("pi_")) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const autorizado = await autorizarPagamento(session, {
        alunoId: paymentIntent.metadata?.alunoId,
        professorId: paymentIntent.metadata?.professorId,
        tipo: paymentIntent.metadata?.tipo,
      });

      if (!autorizado) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      const confirmado = await confirmarPagamentoPaymentIntent(paymentIntent);
      return NextResponse.json({
        confirmado,
        paymentStatus: paymentIntent.status,
      });
    }

    if (sessionId.startsWith("cs_")) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
      const autorizado = await autorizarPagamento(session, {
        alunoId: checkoutSession.metadata?.alunoId,
        professorId: checkoutSession.metadata?.professorId,
        tipo: checkoutSession.metadata?.tipo,
      });

      if (!autorizado) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      const confirmado = await confirmarPagamentoCheckoutSession(checkoutSession);
      return NextResponse.json({
        confirmado,
        paymentStatus: checkoutSession.payment_status,
      });
    }

    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  } catch (error) {
    console.error("[pagamentos/confirmar]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao confirmar pagamento";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
