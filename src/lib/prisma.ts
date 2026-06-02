import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function appendQueryParam(connectionString: string, key: string, value: string): string {
  if (connectionString.includes(`${key}=`)) return connectionString;
  const separator = connectionString.includes("?") ? "&" : "?";
  return `${connectionString}${separator}${key}=${value}`;
}

function appendSslMode(connectionString: string): string {
  return appendQueryParam(connectionString, "sslmode", "require");
}

/** Transaction pooler (6543) exige pgbouncer=true para Prisma. */
function appendSupabasePoolerParams(connectionString: string): string {
  const isPooler =
    connectionString.includes("pooler.supabase.com") &&
    (connectionString.includes(":6543") || connectionString.includes("pooler.supabase.com:5432"));

  if (!isPooler) return connectionString;

  return appendQueryParam(connectionString, "pgbouncer", "true");
}

function assertVercelDatabaseUrl(connectionString: string): void {
  if (process.env.VERCEL !== "1") return;

  const usesDirectDbHost =
    connectionString.includes("@db.") &&
    connectionString.includes(".supabase.co");
  const usesPoolerHost = connectionString.includes("pooler.supabase.com");

  if (usesDirectDbHost && !usesPoolerHost) {
    throw new Error(
      "DATABASE_URL incorreta na Vercel: use o Connection Pooler do Supabase (host *.pooler.supabase.com, porta 6543 em Transaction ou 5432 em Session). Não use db.xxx.supabase.co:5432 como DATABASE_URL."
    );
  }
}

function createPrismaClient(): PrismaClient {
  // Em produção (Vercel/serverless), use DATABASE_URL (pooler). DIRECT_URL é para migrations locais.
  const connectionString = appendSupabasePoolerParams(
    appendSslMode(process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "")
  );

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL ou DIRECT_URL não configurado. Verifique as variáveis de ambiente."
    );
  }

  assertVercelDatabaseUrl(connectionString);

  const isSupabase = connectionString.includes("supabase.co");

  const pool = new Pool({
    connectionString,
    max: isSupabase ? 1 : undefined,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 15_000,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    return Reflect.get(client, property, receiver);
  },
});
