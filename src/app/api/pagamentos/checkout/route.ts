import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  calcularDataVencimento,
  getStripePaymentLink,
  isPlanoPagamentoId,
  valorPlanoCentavos,
  valorPlanoReais,
  type PlanoPagamentoId,
} from "@/lib/planos-pagamento";
import { assertAlunoDoProfessor } from "@/lib/sessao-treino-server";
import { resolveAlunoId } from "@/lib/sessao-treino-server";

interface CheckoutBody {
  alunoId: string;
  planoId: string;
}

function isCheckoutBody(value: unknown): value is CheckoutBody {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return typeof d.alunoId === "string" && typeof d.planoId === "string";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isCheckoutBody(body) || !isPlanoPagamentoId(body.planoId)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const planoId = body.planoId as PlanoPagamentoId;

    if (session.user.role === "aluno") {
      const meuAlunoId = await resolveAlunoId(session);
      if (!meuAlunoId || meuAlunoId !== body.alunoId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    } else if (session.user.role === "professor") {
      const ok = await assertAlunoDoProfessor(body.alunoId, session.user.id);
      if (!ok) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const aluno = await prisma.aluno.findUnique({
      where: { id: body.alunoId },
      select: { id: true, professorId: true, nomeCompleto: true, email: true },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const origin =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
      req.nextUrl.origin;

    const pagamento = await prisma.pagamento.create({
      data: {
        alunoId: aluno.id,
        professorId: aluno.professorId,
        valor: valorPlanoReais(planoId),
        status: "pendente",
        planoId,
        metodoPagamento: "stripe",
        dataVencimento: calcularDataVencimento(planoId),
      },
    });

    const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();

    if (stripeSecret) {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              unit_amount: valorPlanoCentavos(planoId),
              product_data: {
                name: `Fraber — Plano ${planoId}`,
                description: `Assinatura ${planoId} para ${aluno.nomeCompleto}`,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pagamento/cancelado`,
        client_reference_id: pagamento.id,
        metadata: {
          pagamentoId: pagamento.id,
          alunoId: aluno.id,
          planoId,
          professorId: aluno.professorId,
        },
        customer_email: aluno.email || undefined,
      });

      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: { stripeSessionId: checkoutSession.id },
      });

      if (!checkoutSession.url) {
        return NextResponse.json(
          { error: "Stripe não retornou URL de checkout" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        pagamentoId: pagamento.id,
        url: checkoutSession.url,
        modo: "checkout_session",
      });
    }

    const paymentLink = getStripePaymentLink(planoId);
    if (!paymentLink) {
      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: { status: "erro_config" },
      });
      return NextResponse.json(
        {
          error:
            "Pagamento não configurado. Defina STRIPE_SECRET_KEY ou o Payment Link do plano.",
        },
        { status: 503 }
      );
    }

    const separator = paymentLink.includes("?") ? "&" : "?";
    const url = `${paymentLink}${separator}client_reference_id=${encodeURIComponent(pagamento.id)}`;

    return NextResponse.json({
      pagamentoId: pagamento.id,
      url,
      modo: "payment_link",
    });
  } catch (error) {
    console.error("[pagamentos/checkout]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao iniciar pagamento";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
