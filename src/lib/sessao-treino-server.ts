import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ApiSession } from "@/lib/get-api-session";

export type StatusSessao = "em_andamento" | "concluido" | "cancelado";

export function isStatusSessao(value: string): value is StatusSessao {
  return value === "em_andamento" || value === "concluido" || value === "cancelado";
}

export async function resolveAlunoId(session: ApiSession): Promise<string | null> {
  const aluno = await prisma.aluno.findFirst({
    where: {
      OR: [{ usuarioId: session.user.id }, { id: session.user.id }],
    },
    select: { id: true },
  });
  return aluno?.id ?? null;
}

export async function assertTreinoDoAluno(
  treinoId: string,
  alunoId: string
): Promise<boolean> {
  const treino = await prisma.treino.findFirst({
    where: { id: treinoId, alunoId },
    select: { id: true },
  });
  return Boolean(treino);
}

export async function assertAlunoDoProfessor(
  alunoId: string,
  professorId: string
): Promise<boolean> {
  const aluno = await prisma.aluno.findFirst({
    where: { id: alunoId, professorId },
    select: { id: true },
  });
  return Boolean(aluno);
}

export const sessaoInclude = {
  treino: { select: { id: true, nome: true, diaSemana: true } },
  series: {
    orderBy: [
      { exercicioId: "asc" },
      { numeroSerie: "asc" },
    ] satisfies Prisma.TreinoSessaoSerieOrderByWithRelationInput[],
  },
} satisfies Prisma.TreinoSessaoInclude;

export async function criarSeriesParaSessao(
  sessaoId: string,
  treinoId: string
): Promise<void> {
  const exercicios = await prisma.exercicio.findMany({
    where: { treinoId },
    orderBy: { ordem: "asc" },
  });

  const rows = exercicios.flatMap((ex) =>
    Array.from({ length: ex.series }, (_, i) => ({
      sessaoId,
      exercicioId: ex.id,
      numeroSerie: i + 1,
      concluida: false,
    }))
  );

  if (rows.length > 0) {
    await prisma.treinoSessaoSerie.createMany({ data: rows });
  }
}

type SessaoComInclude = NonNullable<
  Awaited<ReturnType<typeof prisma.treinoSessao.findFirst<{ include: typeof sessaoInclude }>>>
>;

export function mapSessaoResponse(sessao: SessaoComInclude | null) {
  if (!sessao) return null;

  return {
    id: sessao.id,
    treinoId: sessao.treinoId,
    alunoId: sessao.alunoId,
    iniciadoEm: sessao.iniciadoEm.toISOString(),
    finalizadoEm: sessao.finalizadoEm?.toISOString() ?? null,
    duracaoSegundos: sessao.duracaoSegundos,
    status: sessao.status as StatusSessao,
    treinoNome: sessao.treino.nome,
    treinoDiaSemana: sessao.treino.diaSemana,
    series: sessao.series.map((s) => ({
      id: s.id,
      exercicioId: s.exercicioId,
      numeroSerie: s.numeroSerie,
      concluida: s.concluida,
      substitutoCatalogoId: s.substitutoCatalogoId,
    })),
  };
}

export async function mapSessaoComCatalogo(sessao: SessaoComInclude | null) {
  const base = mapSessaoResponse(sessao);
  if (!base) return null;

  const catalogIds = [
    ...new Set(
      base.series
        .map((s) => s.substitutoCatalogoId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const catalogos =
    catalogIds.length > 0
      ? await prisma.exercicioCatalogo.findMany({
          where: { id: { in: catalogIds } },
        })
      : [];

  const catalogoPorId = Object.fromEntries(
    catalogos.map((c) => [
      c.id,
      {
        id: c.id,
        nome: c.nome,
        grupoMuscular: c.grupoMuscular,
        imagemUrl: c.imagemUrl ?? c.gifUrl,
        gifUrl: c.gifUrl,
        descricao: c.descricao,
        equipamento: c.equipamento,
        dificuldade: c.dificuldade,
      },
    ])
  );

  return { ...base, catalogoPorId };
}

export async function buscarSessaoCompleta(sessaoId: string) {
  return prisma.treinoSessao.findUnique({
    where: { id: sessaoId },
    include: sessaoInclude,
  });
}
