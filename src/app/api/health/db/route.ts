import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorHint,
  getDatabaseConnectionMeta,
  getDatabaseEnvDiagnostics,
  resolveDatabaseConnectionString,
} from "@/lib/database-url";

export const runtime = "nodejs";

/** Diagnóstico de conexão com o banco (use em produção só para debug pontual). */
export async function GET() {
  const env = getDatabaseEnvDiagnostics();
  const connectionString = resolveDatabaseConnectionString();
  const meta = getDatabaseConnectionMeta(connectionString);
  const hostHint = connectionString
    ? connectionString.replace(/:[^:@]+@/, ":***@").split("?")[0]
    : null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    const usuarios = await prisma.usuario.count();

    return NextResponse.json({
      ok: true,
      env,
      host: hostHint,
      connection: meta,
      usuarios,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        ok: false,
        env,
        host: hostHint,
        connection: meta,
        error: message,
        hint: authErrorHint(message, meta, env),
      },
      { status: 503 }
    );
  }
}
