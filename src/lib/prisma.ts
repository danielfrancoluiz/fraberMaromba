import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  assertRuntimeDatabaseConfig,
  resolveDatabaseConnectionString,
} from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function appendQueryParam(connectionString: string, key: string, value: string): string {
  if (connectionString.includes(`${key}=`)) return connectionString;
  const separator = connectionString.includes("?") ? "&" : "?";
  return `${connectionString}${separator}${key}=${value}`;
}

/** sslmode na URL faz o driver validar o certificado; usamos `ssl` no Pool para Supabase. */
function stripSslQueryParams(connectionString: string): string {
  return connectionString
    .replace(/([?&])sslmode=[^&]*/g, "$1")
    .replace(/([?&])sslrootcert=[^&]*/g, "$1")
    .replace(/([?&])sslcert=[^&]*/g, "$1")
    .replace(/([?&])sslkey=[^&]*/g, "$1")
    .replace(/[?&]$/, "")
    .replace(/\?&/, "?");
}

/**
 * Só Transaction pooler (6543) usa pgbouncer=true.
 * Session pooler (5432) não — senão o driver dá "timeout exceeded when trying to connect".
 */
function appendSupabasePoolerParams(connectionString: string): string {
  const isTransactionPooler =
    connectionString.includes("pooler.supabase.com") &&
    connectionString.includes(":6543");

  if (!isTransactionPooler) return connectionString;

  return appendQueryParam(connectionString, "pgbouncer", "true");
}

function createPrismaClient(): PrismaClient {
  // Em produção (Vercel/serverless), use DATABASE_URL (pooler). DIRECT_URL é para migrations locais.
  const raw = resolveDatabaseConnectionString();

  if (!raw) {
    throw new Error(
      "Nenhuma URL de banco configurada (DATABASE_URL, POSTGRES_PRISMA_URL ou POSTGRES_URL)."
    );
  }

  const isSupabase = raw.includes("supabase");

  let connectionString = appendSupabasePoolerParams(raw);
  if (isSupabase) {
    connectionString = stripSslQueryParams(connectionString);
  }

  assertRuntimeDatabaseConfig(connectionString);

  const pool = new Pool({
    connectionString,
    max: isSupabase ? 5 : undefined,
    idleTimeoutMillis: 20_000,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 20_000,
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

/** Em dev, chame após alterar DATABASE_URL (ou reinicie `npm run dev`). */
export async function resetPrismaClient(): Promise<void> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    return Reflect.get(client, property, receiver);
  },
});
