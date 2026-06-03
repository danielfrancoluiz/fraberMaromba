import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { assertAlunoDoProfessor, resolveAlunoId } from "@/lib/sessao-treino-server";

export async function GET(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoIdParam = req.nextUrl.searchParams.get("alunoId")?.trim();
    let alunoId: string | null = null;

    if (session.user.role === "professor") {
      if (!alunoIdParam) {
        return NextResponse.json(
          { error: "Informe alunoId na query" },
          { status: 400 }
        );
      }
      const ok = await assertAlunoDoProfessor(alunoIdParam, session.user.id);
      if (!ok) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
      alunoId = alunoIdParam;
    } else {
      alunoId = await resolveAlunoId(session);
      if (!alunoId) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
      if (alunoIdParam && alunoIdParam !== alunoId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    const pagamentos = await prisma.pagamento.findMany({
      where: { alunoId },
      orderBy: { criadoEm: "desc" },
      take: 30,
    });

    return NextResponse.json(
      pagamentos.map((p) => ({
        id: p.id,
        alunoId: p.alunoId,
        valor: p.valor,
        status: p.status,
        planoId: p.planoId,
        metodoPagamento: p.metodoPagamento,
        dataVencimento: p.dataVencimento.toISOString(),
        dataPagamento: p.dataPagamento?.toISOString() ?? null,
        criadoEm: p.criadoEm.toISOString(),
      }))
    );
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar pagamentos";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
