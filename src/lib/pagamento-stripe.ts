import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

async function resolverDataVencimento(
  pagamentoId: string,
  fallbackPlanoId?: string
): Promise<Date> {
  const pagamento = await prisma.pagamento.findUnique({
    where: { id: pagamentoId },
    select: { dataVencimento: true, planoId: true },
  });

  if (pagamento?.dataVencimento) {
    return pagamento.dataVencimento;
  }

  const planoId = fallbackPlanoId ?? pagamento?.planoId;
  if (planoId) {
    const plano = await prisma.plano.findUnique({
      where: { id: planoId },
      select: { diasValidade: true },
    });
    if (plano) {
      const d = new Date();
      d.setDate(d.getDate() + Math.max(1, plano.diasValidade));
      return d;
    }
  }

  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

export async function ativarAlunoAposPagamento(
  alunoId: string,
  planoId: string | undefined,
  planoVenceEm: Date
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
      planoVenceEm,
      ...(planoId?.trim() ? { planoId: planoId.trim() } : {}),
    },
  });

  const usuarioId = aluno.usuarioId ?? aluno.id;
  await prisma.usuario.updateMany({
    where: { id: usuarioId },
    data: { status: "ativo_plataforma" },
  });
}

export async function ativarProfessorAposPagamento(
  professorId: string,
  planoId: string | undefined,
  planoVenceEm: Date
): Promise<void> {
  await prisma.usuario.updateMany({
    where: { id: professorId, role: "professor" },
    data: {
      status: "ativo_plataforma",
      planoVenceEm,
      ...(planoId?.trim() ? { planoId: planoId.trim() } : {}),
    },
  });
}

async function marcarPagamentoPago(params: {
  pagamentoId?: string | null;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
}): Promise<{
  id: string;
  alunoId: string | null;
  professorId: string;
  planoId: string;
  dataVencimento: Date;
} | null> {
  const agora = new Date();

  if (params.pagamentoId) {
    return prisma.pagamento.update({
      where: { id: params.pagamentoId },
      data: {
        status: "pago",
        dataPagamento: agora,
        ...(params.stripeSessionId
          ? { stripeSessionId: params.stripeSessionId }
          : {}),
        ...(params.stripePaymentIntentId
          ? { stripePaymentIntentId: params.stripePaymentIntentId }
          : {}),
      },
      select: {
        id: true,
        alunoId: true,
        professorId: true,
        planoId: true,
        dataVencimento: true,
      },
    });
  }

  if (params.stripePaymentIntentId) {
    const existente = await prisma.pagamento.findFirst({
      where: { stripePaymentIntentId: params.stripePaymentIntentId },
      select: {
        id: true,
        alunoId: true,
        professorId: true,
        planoId: true,
        dataVencimento: true,
        status: true,
      },
    });
    if (!existente) return null;
    if (existente.status === "pago") return existente;

    return prisma.pagamento.update({
      where: { id: existente.id },
      data: { status: "pago", dataPagamento: agora },
      select: {
        id: true,
        alunoId: true,
        professorId: true,
        planoId: true,
        dataVencimento: true,
      },
    });
  }

  if (params.stripeSessionId) {
    const existente = await prisma.pagamento.findFirst({
      where: { stripeSessionId: params.stripeSessionId },
      select: {
        id: true,
        alunoId: true,
        professorId: true,
        planoId: true,
        dataVencimento: true,
        status: true,
      },
    });
    if (!existente) return null;
    if (existente.status === "pago") return existente;

    return prisma.pagamento.update({
      where: { id: existente.id },
      data: { status: "pago", dataPagamento: agora },
      select: {
        id: true,
        alunoId: true,
        professorId: true,
        planoId: true,
        dataVencimento: true,
      },
    });
  }

  return null;
}

async function ativarAposPagamentoConfirmado(params: {
  pagamentoId?: string | null;
  alunoId?: string;
  professorId?: string;
  planoId?: string;
  tipo?: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
}): Promise<boolean> {
  const pagamento = await marcarPagamentoPago({
    pagamentoId: params.pagamentoId,
    stripeSessionId: params.stripeSessionId,
    stripePaymentIntentId: params.stripePaymentIntentId,
  });

  const planoId = params.planoId ?? pagamento?.planoId;
  const alunoId = params.alunoId ?? pagamento?.alunoId ?? undefined;
  const professorId = params.professorId ?? pagamento?.professorId;
  const tipo = params.tipo;

  if (!pagamento && !alunoId && !professorId) {
    return false;
  }

  const pagamentoId = pagamento?.id ?? params.pagamentoId ?? "";
  const planoVenceEm = pagamento?.dataVencimento
    ? pagamento.dataVencimento
    : await resolverDataVencimento(pagamentoId, planoId);

  if (alunoId) {
    await ativarAlunoAposPagamento(alunoId, planoId, planoVenceEm);
    return true;
  }

  if (professorId && (tipo === "professor" || !alunoId)) {
    await ativarProfessorAposPagamento(professorId, planoId, planoVenceEm);
    return true;
  }

  return false;
}

export async function confirmarPagamentoCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  if (session.payment_status !== "paid") {
    return false;
  }

  return ativarAposPagamentoConfirmado({
    pagamentoId: session.metadata?.pagamentoId ?? session.client_reference_id,
    alunoId: session.metadata?.alunoId || undefined,
    professorId: session.metadata?.professorId || undefined,
    planoId: session.metadata?.planoId || undefined,
    tipo: session.metadata?.tipo,
    stripeSessionId: session.id,
  });
}

export async function confirmarPagamentoPaymentIntent(
  paymentIntent: Stripe.PaymentIntent
): Promise<boolean> {
  if (paymentIntent.status !== "succeeded") {
    return false;
  }

  return ativarAposPagamentoConfirmado({
    pagamentoId: paymentIntent.metadata?.pagamentoId || undefined,
    alunoId: paymentIntent.metadata?.alunoId || undefined,
    professorId: paymentIntent.metadata?.professorId || undefined,
    planoId: paymentIntent.metadata?.planoId || undefined,
    tipo: paymentIntent.metadata?.tipo,
    stripePaymentIntentId: paymentIntent.id,
  });
}
