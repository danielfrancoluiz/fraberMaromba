import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { confirmarPagamentoPaymentIntent } from "@/lib/pagamento-stripe";
import { resolveAlunoId } from "@/lib/sessao-treino-server";
import { destinoAposModulos } from "@/lib/destino-pos-pagamento";
import {
  menorVencimentoVigente,
  modulosVigentes,
  normalizarModulos,
  parseModulosVencimentos,
} from "@/lib/modulos-aluno";

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
    const paymentIntentId =
      typeof body === "object" &&
      body !== null &&
      "paymentIntentId" in body &&
      typeof (body as { paymentIntentId: string }).paymentIntentId === "string"
        ? (body as { paymentIntentId: string }).paymentIntentId.trim()
        : "";

    if (!paymentIntentId.startsWith("pi_")) {
      return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
    }

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

    const alunoIdMeta = paymentIntent.metadata?.alunoId?.trim();
    const modulosPagos = (paymentIntent.metadata?.modulos ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let sessaoAluno: {
      modulosAtivos: string[];
      modulosVencimentos: Record<string, string>;
      planoVenceEm?: string;
      planoId?: string;
      status: string;
      destino: string;
    } | null = null;

    if (alunoIdMeta) {
      const aluno = await prisma.aluno.findUnique({
        where: { id: alunoIdMeta },
        select: {
          planoId: true,
          planoVenceEm: true,
          modulosAtivos: true,
          modulosVencimentos: true,
          status: true,
        },
      });
      if (aluno) {
        let venc = parseModulosVencimentos(aluno.modulosVencimentos);
        if (Object.keys(venc).length === 0 && aluno.planoVenceEm) {
          for (const id of normalizarModulos(aluno.modulosAtivos)) {
            venc[id] = aluno.planoVenceEm.toISOString();
          }
        }
        const vigentes = modulosVigentes(venc);
        sessaoAluno = {
          modulosAtivos: vigentes,
          modulosVencimentos: venc as Record<string, string>,
          planoVenceEm:
            menorVencimentoVigente(venc) ??
            aluno.planoVenceEm?.toISOString(),
          planoId: aluno.planoId || undefined,
          status: aluno.status,
          destino: destinoAposModulos(
            modulosPagos.length ? modulosPagos : vigentes
          ),
        };
      }
    }

    return NextResponse.json({
      confirmado,
      paymentStatus: paymentIntent.status,
      ...(sessaoAluno ?? {}),
    });
  } catch (error) {
    console.error("[pagamentos/confirmar]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao confirmar pagamento";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
