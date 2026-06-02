import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorHint,
  getDatabaseConnectionMeta,
  getDatabaseEnvDiagnostics,
  resolveDatabaseConnectionString,
} from "@/lib/database-url";
import { getNextAuthDiagnostics } from "@/lib/nextauth-config";

export const runtime = "nodejs";

function isBcryptHash(valor: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(valor);
}

function mapContaParaDebug(conta: {
  email: string;
  role: string;
  status: string;
  senha: string;
}) {
  const bcrypt = isBcryptHash(conta.senha);

  return {
    email: conta.email,
    role: conta.role,
    status: conta.status,
    senhaBcrypt: bcrypt,
    tipoSenha: bcrypt ? "bcrypt" : "texto_plano",
    /** Valor exato no banco. Bcrypt NÃO pode ser “descriptografado”; use texto_plano ou senha 123456 nos usuários do seed. */
    senhaNoBanco: conta.senha,
    dicaLogin: bcrypt
      ? "Senha hasheada (seed/cadastro: tente 123456). Não é possível exibir a senha original."
      : "Senha em texto puro — o valor em senhaNoBanco é a senha para login.",
  };
}

/** Diagnóstico de conexão e auth (remover ou proteger após testes). */
export async function GET() {
  const env = getDatabaseEnvDiagnostics();
  const auth = getNextAuthDiagnostics();
  const connectionString = resolveDatabaseConnectionString();
  const meta = getDatabaseConnectionMeta(connectionString);
  const hostHint = connectionString
    ? connectionString.replace(/:[^:@]+@/, ":***@").split("?")[0]
    : null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    const usuarios = await prisma.usuario.count();
    const contas = await prisma.usuario.findMany({
      select: { email: true, role: true, status: true, senha: true },
      orderBy: { email: "asc" },
    });

    return NextResponse.json({
      ok: true,
      avisoSeguranca:
        "Endpoint de teste: expõe senhas em texto plano. Remova senhaNoBanco antes de ir para produção final.",
      env,
      host: hostHint,
      connection: meta,
      usuarios,
      auth: {
        ...auth,
        sessionDeveFuncionar: auth.hasSecret && auth.urlAlinhada !== false,
        configureNaVercel: {
          NEXTAUTH_URL: auth.urlRecomendada,
          NEXTAUTH_SECRET:
            "string aleatória longa OU deixe vazio se SUPABASE_JWT_SECRET existir (fallback automático)",
        },
      },
      contas: contas.map(mapContaParaDebug),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        ok: false,
        env,
        auth: getNextAuthDiagnostics(),
        host: hostHint,
        connection: meta,
        error: message,
        hint: authErrorHint(message, meta, env),
      },
      { status: 503 }
    );
  }
}
