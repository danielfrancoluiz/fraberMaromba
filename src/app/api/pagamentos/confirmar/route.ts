import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { confirmarPagamentoCheckoutSession } from "@/lib/pagamento-stripe";
import { resolveAlunoId } from "@/lib/sessao-treino-server";

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

    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    const alunoId = checkoutSession.metadata?.alunoId;
    if (!alunoId) {
      return NextResponse.json(
        { error: "Sessão sem vínculo de aluno" },
        { status: 400 }
      );
    }

    if (session.user.role === "aluno") {
      const meuAlunoId = await resolveAlunoId(session);
      if (!meuAlunoId || meuAlunoId !== alunoId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    } else if (session.user.role === "professor") {
      const aluno = await prisma.aluno.findFirst({
        where: { id: alunoId, professorId: session.user.id },
        select: { id: true },
      });
      if (!aluno) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const confirmado = await confirmarPagamentoCheckoutSession(checkoutSession);

    return NextResponse.json({
      confirmado,
      paymentStatus: checkoutSession.payment_status,
    });
  } catch (error) {
    console.error("[pagamentos/confirmar]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao confirmar pagamento";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
