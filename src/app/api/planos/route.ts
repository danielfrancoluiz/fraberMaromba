import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import {
  listarPlanos,
  planoParaOpcaoCheckout,
} from "@/lib/planos-server";

/**
 * GET /api/planos
 * - ?checkout=1 → só planos cobráveis (Stripe)
 * - ?todos=1 → professor: todos os planos (edição)
 * - padrão → planos ativos (cadastro de aluno)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const checkout = req.nextUrl.searchParams.get("checkout") === "1";
    const todos = req.nextUrl.searchParams.get("todos") === "1";

    if (todos && session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const planos = await listarPlanos(
      checkout
        ? { apenasCheckout: true }
        : todos
          ? {}
          : { apenasAtivos: true }
    );

    return NextResponse.json(planos.map(planoParaOpcaoCheckout));
  } catch (error) {
    console.error("[planos]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar planos";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
