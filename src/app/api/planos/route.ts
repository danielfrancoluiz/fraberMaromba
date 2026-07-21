import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import {
  listarPlanos,
  planoParaOpcaoCheckout,
} from "@/lib/planos-server";

/**
 * GET /api/planos
 * - ?checkout=1 → só planos cobráveis (Stripe)
 * - padrão → planos ativos (cadastro / listagens)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const checkout = req.nextUrl.searchParams.get("checkout") === "1";

    const planos = await listarPlanos(
      checkout ? { apenasCheckout: true } : { apenasAtivos: true }
    );

    return NextResponse.json(planos.map(planoParaOpcaoCheckout));
  } catch (error) {
    console.error("[planos]", error);
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar planos";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
