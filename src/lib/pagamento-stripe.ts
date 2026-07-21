import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function ativarAlunoAposPagamento(
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
      ...(planoId?.trim() ? { planoId: planoId.trim() } : {}),
    },
  });

  const usuarioId = aluno.usuarioId ?? aluno.id;
  await prisma.usuario.updateMany({
    where: { id: usuarioId },
    data: { status: "ativo_plataforma" },
  });
}

export async function confirmarPagamentoCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  if (session.payment_status !== "paid") {
    return false;
  }

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
    return true;
  }

  if (alunoId) {
    await prisma.pagamento.updateMany({
      where: {
        alunoId,
        status: "pendente",
        stripeSessionId: session.id,
      },
      data: { status: "pago", dataPagamento: new Date() },
    });
    await ativarAlunoAposPagamento(alunoId, planoId);
    return true;
  }

  return false;
}
