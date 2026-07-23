import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import {
  MODULOS_ALUNO,
  labelModulo,
  moduloVigente,
  normalizarModulos,
  parseModulosVencimentos,
  type ModuloAlunoId,
} from "@/lib/modulos-aluno";
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

    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      select: {
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

    const pagamentos = await prisma.pagamento.findMany({
      where: { alunoId, status: "pago" },
      select: {
        modulos: true,
        dataPagamento: true,
        criadoEm: true,
      },
      orderBy: { criadoEm: "asc" },
    });

    const mesesPorModulo: Partial<Record<ModuloAlunoId, number>> = {};
    for (const p of pagamentos) {
      for (const id of normalizarModulos(p.modulos)) {
        mesesPorModulo[id] = (mesesPorModulo[id] ?? 0) + 1;
      }
    }

    const idsComHistorico = new Set<ModuloAlunoId>([
      ...MODULOS_ALUNO.map((m) => m.id).filter(
        (id) => (mesesPorModulo[id] ?? 0) > 0 || Boolean(venc[id])
      ),
    ]);

    // Mantém ordem canônica musculação → corrida → nutrição
    const modulos = MODULOS_ALUNO.filter((m) => idsComHistorico.has(m.id)).map(
      (m) => {
        const venceEm = venc[m.id] ?? null;
        const ativo = moduloVigente(venceEm);
        const pagos = mesesPorModulo[m.id] ?? 0;
        // Legado: pagamento antigo sem array `modulos` — se há vencimento, conta ao menos 1.
        const mesesContratados = Math.max(pagos, venceEm ? 1 : 0);
        return {
          id: m.id,
          label: labelModulo(m.id),
          mesesContratados,
          venceEm,
          ativo,
        };
      }
    );

    return NextResponse.json({ modulos });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao listar módulos";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
