import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { ensurePlanosSeeded, planoParaOpcaoCheckout } from "@/lib/planos-server";

interface AtualizarPlanoBody {
  nome?: string;
  valorCentavos?: number;
  diasValidade?: number;
  permiteCheckout?: boolean;
  ativo?: boolean;
  ordem?: number;
}

function parseBody(value: unknown): AtualizarPlanoBody | null {
  if (typeof value !== "object" || value === null) return null;
  const d = value as Record<string, unknown>;
  const body: AtualizarPlanoBody = {};

  if (d.nome !== undefined) {
    if (typeof d.nome !== "string" || !d.nome.trim()) return null;
    body.nome = d.nome.trim();
  }
  if (d.valorCentavos !== undefined) {
    if (typeof d.valorCentavos !== "number" || !Number.isInteger(d.valorCentavos) || d.valorCentavos < 0) {
      return null;
    }
    body.valorCentavos = d.valorCentavos;
  }
  if (d.diasValidade !== undefined) {
    if (typeof d.diasValidade !== "number" || !Number.isInteger(d.diasValidade) || d.diasValidade < 1) {
      return null;
    }
    body.diasValidade = d.diasValidade;
  }
  if (d.permiteCheckout !== undefined) {
    if (typeof d.permiteCheckout !== "boolean") return null;
    body.permiteCheckout = d.permiteCheckout;
  }
  if (d.ativo !== undefined) {
    if (typeof d.ativo !== "boolean") return null;
    body.ativo = d.ativo;
  }
  if (d.ordem !== undefined) {
    if (typeof d.ordem !== "number" || !Number.isInteger(d.ordem)) return null;
    body.ordem = d.ordem;
  }

  return body;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await ensurePlanosSeeded();

    const raw: unknown = await req.json();
    const body = parseBody(raw);
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Checkout Stripe exige valor > 0
    if (
      body.valorCentavos !== undefined &&
      body.valorCentavos === 0 &&
      body.permiteCheckout !== false
    ) {
      const atual = await prisma.plano.findUnique({ where: { id } });
      const vaiPermitirCheckout =
        body.permiteCheckout ?? atual?.permiteCheckout ?? true;
      if (vaiPermitirCheckout) {
        return NextResponse.json(
          {
            error:
              "Plano com valor R$ 0 não pode ter checkout. Desative 'permite checkout' (ex.: Gympass).",
          },
          { status: 400 }
        );
      }
    }

    const plano = await prisma.plano.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(planoParaOpcaoCheckout(plano));
  } catch (error) {
    console.error("[planos/id]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao atualizar plano";
    if (mensagem.includes("Record to update not found")) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
