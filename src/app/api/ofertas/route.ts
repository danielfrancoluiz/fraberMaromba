import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import {
  atualizarOferta,
  listarOfertas,
  type OfertaGrupo,
} from "@/lib/ofertas-planos-server";

export async function GET(req: NextRequest) {
  try {
    const grupo = req.nextUrl.searchParams.get("grupo")?.trim() as
      | OfertaGrupo
      | undefined;
    const todas = req.nextUrl.searchParams.get("todas") === "1";

    const session = await getApiSession(req);
    const isProfessor = session?.user?.role === "professor";

    const ofertas = await listarOfertas({
      grupo: grupo === "treino" || grupo === "nutricao" ? grupo : undefined,
      apenasAtivas: !(todas && isProfessor),
    });

    return NextResponse.json(ofertas);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar ofertas";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session || session.user.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const id = typeof b.id === "string" ? b.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Informe o id da oferta." }, { status: 400 });
    }

    const patch: {
      nome?: string;
      descricao?: string | null;
      valorCentavos?: number;
      diasValidade?: number;
      ativo?: boolean;
      badge?: string | null;
      ordem?: number;
    } = {};

    if (typeof b.nome === "string" && b.nome.trim()) patch.nome = b.nome.trim();
    if (b.descricao === null || typeof b.descricao === "string") {
      patch.descricao =
        typeof b.descricao === "string" ? b.descricao.trim() || null : null;
    }
    if (typeof b.valorCentavos === "number" && b.valorCentavos >= 0) {
      patch.valorCentavos = Math.round(b.valorCentavos);
    }
    // Aceita valor em reais para facilitar UI: valorReais: 49.00
    if (typeof b.valorReais === "number" && b.valorReais >= 0) {
      patch.valorCentavos = Math.round(b.valorReais * 100);
    }
    if (typeof b.diasValidade === "number" && b.diasValidade >= 1) {
      patch.diasValidade = Math.round(b.diasValidade);
    }
    if (typeof b.ativo === "boolean") patch.ativo = b.ativo;
    if (b.badge === null || typeof b.badge === "string") {
      patch.badge = typeof b.badge === "string" ? b.badge.trim() || null : null;
    }
    if (typeof b.ordem === "number") patch.ordem = Math.round(b.ordem);

    const atualizada = await atualizarOferta(id, patch);
    if (!atualizada) {
      return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 });
    }
    return NextResponse.json(atualizada);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao atualizar oferta";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
