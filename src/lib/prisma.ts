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

/** Transaction pooler (6543) exige pgbouncer=true para Prisma. */
function appendSupabasePoolerParams(connectionString: string): string {
  const isPooler =
    connectionString.includes("pooler.supabase.com") &&
    (connectionString.includes(":6543") || connectionString.includes("pooler.supabase.com:5432"));

  if (!isPooler) return connectionString;

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
