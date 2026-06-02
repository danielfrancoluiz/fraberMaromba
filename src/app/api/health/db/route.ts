import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Diagnóstico de conexão com o banco (use em produção só para debug pontual). */
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const hostHint = databaseUrl.replace(/:[^:@]+@/, ":***@").split("?")[0];

  try {
    await prisma.$queryRaw`SELECT 1`;
    const usuarios = await prisma.usuario.count();

    return NextResponse.json({
      ok: true,
      host: hostHint,
      usuarios,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        ok: false,
        host: hostHint,
        error: message,
        hint:
          "Na Vercel, DATABASE_URL deve usar *.pooler.supabase.com:6543 (Transaction), usuário postgres.SEU_PROJECT_REF.",
      },
      { status: 503 }
    );
  }
}
