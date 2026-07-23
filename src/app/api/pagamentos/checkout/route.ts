import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { isStripeConfigurado, stripe } from "@/lib/stripe";
import {
  buscarPlanoPorId,
  calcularDataVencimentoPorDias,
} from "@/lib/planos-server";
import { buscarPrecoPorQuantidade } from "@/lib/precos-modulos-server";
import {
  labelsModulos,
  modulosVigentes,
  normalizarModulos,
  parseModulosVencimentos,
  planoIdPorQuantidade,
} from "@/lib/modulos-aluno";
import { assertAlunoDoProfessor, resolveAlunoId } from "@/lib/sessao-treino-server";

interface CheckoutBody {
  /** Professor: id do plano da plataforma. Aluno: opcional se enviar modulos. */
  planoId?: string;
  alunoId?: string;
  /** Módulos escolhidos pelo aluno. */
  modulos?: string[];
}

function isCheckoutBody(value: unknown): value is CheckoutBody {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return (
    (d.planoId === undefined || typeof d.planoId === "string") &&
    (d.alunoId === undefined || typeof d.alunoId === "string") &&
    (d.modulos === undefined ||
      (Array.isArray(d.modulos) && d.modulos.every((m) => typeof m === "string")))
  );
}

function calcularVencimentoComRenovacao(
  diasValidade: number,
  planoVenceEmAtual: Date | null | undefined
): Date {
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

    if (!isStripeConfigurado()) {
      return NextResponse.json(
        { error: "Pagamento não configurado. Contate o suporte da Fraber." },
        { status: 503 }
      );
    }

    const body: unknown = await req.json();
    if (!isCheckoutBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const alunoIdBody = body.alunoId?.trim();
    const modulosEscolhidos = normalizarModulos(body.modulos ?? []);

    // --- Professor contratando o próprio plano ---
    if (session.user.role === "professor" && !alunoIdBody && modulosEscolhidos.length === 0) {
      const planoId = body.planoId?.trim();
      if (!planoId) {
        return NextResponse.json({ error: "Plano não informado" }, { status: 400 });
      }

      const plano = await buscarPlanoPorId(planoId);
      if (!plano || !plano.ativo) {
        return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
      }
      if (!plano.permiteCheckout || plano.valorCentavos <= 0) {
        return NextResponse.json(
          { error: "Este plano não pode ser cobrado online." },
          { status: 400 }
        );
      }

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

      const dataVencimento = calcularVencimentoComRenovacao(
        plano.diasValidade,
        professor.planoVenceEm
      );
      const valorReais = plano.valorCentavos / 100;

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

    // --- Aluno: módulos mensais ---
    if (modulosEscolhidos.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos um módulo (Musculação, Corrida ou Nutrição)." },
        { status: 400 }
      );
    }

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
        modulosAtivos: true,
        modulosVencimentos: true,
      },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    let venc = parseModulosVencimentos(aluno.modulosVencimentos);
    if (Object.keys(venc).length === 0 && aluno.planoVenceEm) {
      for (const id of normalizarModulos(aluno.modulosAtivos)) {
        venc[id] = aluno.planoVenceEm.toISOString();
      }
    }
    const jaVigentes = new Set(modulosVigentes(venc));
    const modulosNovos = modulosEscolhidos.filter((m) => !jaVigentes.has(m));

    if (modulosNovos.length === 0) {
      return NextResponse.json(
        {
          error:
            "Selecione ao menos um módulo novo. Os já ativos não podem ser cobrados de novo nesta compra.",
        },
        { status: 400 }
      );
    }

    const preco = await buscarPrecoPorQuantidade(modulosNovos.length);
    if (!preco || !preco.ativo || preco.valorCentavos <= 0) {
      return NextResponse.json(
        { error: "Preço do pacote não configurado." },
        { status: 400 }
      );
    }

    // Nova compra = novo período (não estende o vencimento dos módulos antigos).
    const dataVencimento = calcularDataVencimentoPorDias(preco.diasValidade);
    const planoId = planoIdPorQuantidade(modulosNovos.length);
    const valorReais = preco.valorCentavos / 100;
    const nomes = labelsModulos(modulosNovos);

    const pagamento = await prisma.pagamento.create({
      data: {
        alunoId: aluno.id,
        professorId: aluno.professorId,
        valor: valorReais,
        status: "pendente",
        planoId,
        modulos: modulosNovos,
        metodoPagamento: "cartao",
        dataVencimento,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: preco.valorCentavos,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      description: `Fraber — ${nomes} (mensal)`,
      receipt_email: aluno.email || undefined,
      metadata: {
        pagamentoId: pagamento.id,
        alunoId: aluno.id,
        planoId,
        professorId: aluno.professorId,
        tipo: "aluno",
        modulos: modulosNovos.join(","),
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
