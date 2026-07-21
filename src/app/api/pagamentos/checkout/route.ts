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
  planoId: string;
  /** Pagamento do aluno (próprio ou pelo professor). Omitido = professor paga a si. */
  alunoId?: string;
}

function isCheckoutBody(value: unknown): value is CheckoutBody {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d.planoId === "string" &&
    (d.alunoId === undefined || typeof d.alunoId === "string")
  );
}

async function calcularVencimentoComRenovacao(
  diasValidade: number,
  planoVenceEmAtual: Date | null | undefined
): Promise<Date> {
  const base =
    planoVenceEmAtual && planoVenceEmAtual.getTime() > Date.now()
      ? planoVenceEmAtual
      : new Date();
  return calcularDataVencimentoPorDias(diasValidade, base);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isCheckoutBody(body) || !body.planoId.trim()) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const planoId = body.planoId.trim();
    const alunoIdBody = body.alunoId?.trim();

    const plano = await buscarPlanoPorId(planoId);
    if (!plano || !plano.ativo) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }
    if (!plano.permiteCheckout || plano.valorCentavos <= 0) {
      return NextResponse.json(
        {
          error:
            "Este plano não pode ser cobrado online (ex.: Gympass / valor zero).",
        },
        { status: 400 }
      );
    }

    if (!isStripeConfigurado()) {
      return NextResponse.json(
        {
          error: "Pagamento não configurado. Contate o suporte da Fraber.",
        },
        { status: 503 }
      );
    }

    const valorReais = plano.valorCentavos / 100;

    // --- Professor contratando o próprio plano ---
    if (session.user.role === "professor" && !alunoIdBody) {
      const professorId = session.user.id;
      const professor = await prisma.usuario.findUnique({
        where: { id: professorId },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          planoVenceEm: true,
        },
      });

      if (!professor || professor.role !== "professor") {
        return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });
      }

      const dataVencimento = await calcularVencimentoComRenovacao(
        plano.diasValidade,
        professor.planoVenceEm
      );

      const pagamento = await prisma.pagamento.create({
        data: {
          alunoId: null,
          professorId,
          valor: valorReais,
          status: "pendente",
          planoId: plano.id,
          metodoPagamento: "cartao",
          dataVencimento,
        },
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: plano.valorCentavos,
        currency: "brl",
        automatic_payment_methods: { enabled: true },
        description: `Fraber — ${plano.nome} (professor)`,
        receipt_email: professor.email || undefined,
        metadata: {
          pagamentoId: pagamento.id,
          professorId,
          planoId: plano.id,
          tipo: "professor",
        },
      });

      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      if (!paymentIntent.client_secret) {
        return NextResponse.json(
          { error: "Não foi possível iniciar o pagamento" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        pagamentoId: pagamento.id,
        clientSecret: paymentIntent.client_secret,
      });
    }

    // --- Pagamento vinculado a aluno ---
    if (!alunoIdBody) {
      return NextResponse.json({ error: "Aluno não informado" }, { status: 400 });
    }

    if (session.user.role === "aluno") {
      const meuAlunoId = await resolveAlunoId(session);
      if (!meuAlunoId || meuAlunoId !== alunoIdBody) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    } else if (session.user.role === "professor") {
      const ok = await assertAlunoDoProfessor(alunoIdBody, session.user.id);
      if (!ok) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoIdBody },
      select: {
        id: true,
        professorId: true,
        nomeCompleto: true,
        email: true,
        planoVenceEm: true,
      },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const dataVencimento = await calcularVencimentoComRenovacao(
      plano.diasValidade,
      aluno.planoVenceEm
    );

    const pagamento = await prisma.pagamento.create({
      data: {
        alunoId: aluno.id,
        professorId: aluno.professorId,
        valor: valorReais,
        status: "pendente",
        planoId: plano.id,
        metodoPagamento: "cartao",
        dataVencimento,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: plano.valorCentavos,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      description: `Fraber — ${plano.nome} para ${aluno.nomeCompleto}`,
      receipt_email: aluno.email || undefined,
      metadata: {
        pagamentoId: pagamento.id,
        alunoId: aluno.id,
        planoId: plano.id,
        professorId: aluno.professorId,
        tipo: "aluno",
      },
    });

    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pagamentoId: pagamento.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("[pagamentos/checkout]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao iniciar pagamento";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
