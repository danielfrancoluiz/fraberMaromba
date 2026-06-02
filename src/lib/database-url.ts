export type DatabaseConnectionMeta = {
  user: string;
  host: string;
  port: string;
  database: string;
  hasPassword: boolean;
  usesPooler: boolean;
  poolerUserOk: boolean;
};

export type DatabaseRuntimeSource =
  | "DATABASE_URL"
  | "POSTGRES_PRISMA_URL"
  | "POSTGRES_URL"
  | "DIRECT_URL"
  | "POSTGRES_URL_NON_POOLING"
  | "none";

export type DatabaseEnvDiagnostics = {
  vercel: boolean;
  hasDatabaseUrl: boolean;
  hasPostgresPrismaUrl: boolean;
  hasPostgresUrl: boolean;
  hasDirectUrl: boolean;
  hasPostgresNonPooling: boolean;
  hasDatabasePassword: boolean;
  runtimeSource: DatabaseRuntimeSource;
};

function toUrl(connectionString: string): URL {
  return new URL(connectionString.replace(/^postgresql:/i, "postgres:"));
}

function fromUrl(url: URL): string {
  return url.toString().replace(/^postgres:/i, "postgresql:");
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** Runtime: pooler / Prisma. Integração Vercel+Supabase define POSTGRES_PRISMA_URL. */
export function pickRuntimeConnectionString(): {
  base: string;
  source: DatabaseRuntimeSource;
} {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const postgresPrismaUrl = process.env.POSTGRES_PRISMA_URL?.trim();
  const postgresUrl = process.env.POSTGRES_URL?.trim();
  const directUrl = process.env.DIRECT_URL?.trim();

  if (databaseUrl) return { base: databaseUrl, source: "DATABASE_URL" };
  if (postgresPrismaUrl) return { base: postgresPrismaUrl, source: "POSTGRES_PRISMA_URL" };
  if (postgresUrl) return { base: postgresUrl, source: "POSTGRES_URL" };

  // Local dev: DIRECT_URL ou POSTGRES_URL_NON_POOLING
  const postgresNonPooling = process.env.POSTGRES_URL_NON_POOLING?.trim();
  if (directUrl) return { base: directUrl, source: "DIRECT_URL" };
  if (postgresNonPooling) return { base: postgresNonPooling, source: "POSTGRES_URL_NON_POOLING" };

  return { base: "", source: "none" };
}

/** Migrations / seed local: conexão direta. */
export function pickDirectConnectionString(): string {
  return firstNonEmpty(
    process.env.DIRECT_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL
  );
}

export function getDatabaseEnvDiagnostics(): DatabaseEnvDiagnostics {
  const { source } = pickRuntimeConnectionString();

  return {
    vercel: process.env.VERCEL === "1",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL?.trim()),
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL?.trim()),
    hasDirectUrl: Boolean(process.env.DIRECT_URL?.trim()),
    hasPostgresNonPooling: Boolean(process.env.POSTGRES_URL_NON_POOLING?.trim()),
    hasDatabasePassword: Boolean(process.env.DATABASE_PASSWORD?.trim()),
    runtimeSource: source,
  };
}

/** Senha com caracteres especiais: defina DATABASE_PASSWORD na Vercel (codificação automática). */
export function resolveDatabaseConnectionString(): string {
  const { base } = pickRuntimeConnectionString();
  const passwordOverride = process.env.DATABASE_PASSWORD?.trim();

  if (!base) return "";
  if (!passwordOverride) return base;

  const url = toUrl(base);
  url.password = passwordOverride;
  return fromUrl(url);
}

export function hasRuntimeDatabaseConfig(): boolean {
  const env = getDatabaseEnvDiagnostics();
  return (
    env.hasDatabaseUrl ||
    env.hasPostgresPrismaUrl ||
    env.hasPostgresUrl
  );
}

export function assertRuntimeDatabaseConfig(connectionString: string): void {
  if (process.env.VERCEL !== "1") return;

  if (!hasRuntimeDatabaseConfig()) {
    throw new Error(
      "Nenhuma URL de banco para runtime na Vercel. Use a integração Supabase (POSTGRES_PRISMA_URL) ou defina DATABASE_URL com o Transaction pooler (porta 6543)."
    );
  }

  const usesDirectDbHost =
    connectionString.includes("@db.") &&
    connectionString.includes(".supabase.co");
  const usesPoolerHost = connectionString.includes("pooler.supabase.com");

  if (usesDirectDbHost && !usesPoolerHost) {
    throw new Error(
      "URL de runtime aponta para conexão direta (db.xxx.supabase.co:5432). Use POSTGRES_PRISMA_URL da integração Vercel+Supabase ou DATABASE_URL com *.pooler.supabase.com:6543."
    );
  }
}

export function getDatabaseConnectionMeta(
  connectionString: string
): DatabaseConnectionMeta | null {
  if (!connectionString) return null;

  try {
    const url = toUrl(connectionString);
    const usesPooler = url.hostname.includes("pooler.supabase.com");
    const user = decodeURIComponent(url.username);
    const poolerUserOk =
      !usesPooler || (user.startsWith("postgres.") && user !== "postgres");

    return {
      user,
      host: url.hostname,
      port: url.port || "5432",
      database: url.pathname.replace(/^\//, "") || "postgres",
      hasPassword: url.password.length > 0,
      usesPooler,
      poolerUserOk,
    };
  } catch {
    return null;
  }
}

export function authErrorHint(
  message: string,
  meta: DatabaseConnectionMeta | null,
  env: DatabaseEnvDiagnostics
): string {
  if (
    env.vercel &&
    !env.hasDatabaseUrl &&
    !env.hasPostgresPrismaUrl &&
    !env.hasPostgresUrl
  ) {
    return "Conecte Supabase na Vercel (Storage/Integrations) ou defina DATABASE_URL com o Transaction pooler. Depois: Redeploy.";
  }

  if (message.includes("28P01") || message.includes("password authentication failed")) {
    return [
      "Senha do banco incorreta ou integração Supabase desatualizada.",
      "Na Vercel: desconecte e reconecte o Supabase, ou copie POSTGRES_PRISMA_URL manualmente para DATABASE_URL.",
      "Redeploy obrigatório.",
    ].join(" ");
  }

  if (meta && meta.usesPooler && !meta.poolerUserOk) {
    return `Usuário deve ser postgres.SEU_PROJECT_REF, não "${meta.user}".`;
  }

  return "Verifique POSTGRES_PRISMA_URL / DATABASE_URL na Vercel (Production) e faça Redeploy.";
}
