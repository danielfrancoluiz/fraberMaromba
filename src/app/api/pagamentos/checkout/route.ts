import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { isStripeConfigurado, stripe } from "@/lib/stripe";
import {
  buscarPlanoPorId,
  calcularDataVencimentoPorDias,
} from "@/lib/planos-server";
import { assertAlunoDoProfessor, resolveAlunoId } from "@/lib/sessao-treino-server";

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
    if (!isCheckoutBody(body) || !body.planoId.trim() || !body.alunoId.trim()) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const planoId = body.planoId.trim();

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

    const plano = await buscarPlanoPorId(planoId);
    if (!plano || !plano.ativo) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }
    if (!plano.permiteCheckout || plano.valorCentavos <= 0) {
      return NextResponse.json(
        {
          error:
            "Este plano não pode ser cobrado pelo Stripe (ex.: Gympass / valor zero).",
        },
        { status: 400 }
      );
    }

    if (!isStripeConfigurado()) {
      return NextResponse.json(
        {
          error:
            "Pagamento não configurado. Defina STRIPE_SECRET_KEY na Vercel (e STRIPE_WEBHOOK_SECRET).",
        },
        { status: 503 }
      );
    }

    const aluno = await prisma.aluno.findUnique({
      where: { id: body.alunoId },
      select: { id: true, professorId: true, nomeCompleto: true, email: true },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const origin =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? req.nextUrl.origin;

    const valorReais = plano.valorCentavos / 100;

    const pagamento = await prisma.pagamento.create({
      data: {
        alunoId: aluno.id,
        professorId: aluno.professorId,
        valor: valorReais,
        status: "pendente",
        planoId: plano.id,
        metodoPagamento: "stripe",
        dataVencimento: calcularDataVencimentoPorDias(plano.diasValidade),
      },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: plano.valorCentavos,
            product_data: {
              name: `Fraber — ${plano.nome}`,
              description: `${plano.nome} para ${aluno.nomeCompleto}`,
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
        planoId: plano.id,
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
  } catch (error) {
    console.error("[pagamentos/checkout]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao iniciar pagamento";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
