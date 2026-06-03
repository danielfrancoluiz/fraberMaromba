function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  return withProtocol.replace(/\/$/, "");
}

/** NEXTAUTH_SECRET não pode ser URL/domínio — só string aleatória longa. */
export function isValidNextAuthSecret(secret: string): boolean {
  const s = secret.trim();
  if (s.length < 16) return false;
  if (s.includes("://")) return false;
  if (/\.vercel\.app$/i.test(s)) return false;
  if (/^[\w.-]+\.(com|app|net|org|br)$/i.test(s)) return false;
  return true;
}

/** Secret para JWT do NextAuth. Ignora NEXTAUTH_SECRET se for URL/domínio por engano. */
export function getNextAuthSecret(): string | undefined {
  const explicit = process.env.NEXTAUTH_SECRET?.trim();
  if (explicit && isValidNextAuthSecret(explicit)) return explicit;

  const authSecret = process.env.AUTH_SECRET?.trim();
  if (authSecret && isValidNextAuthSecret(authSecret)) return authSecret;

  const supabaseJwt = process.env.SUPABASE_JWT_SECRET?.trim();
  if (supabaseJwt && isValidNextAuthSecret(supabaseJwt)) return supabaseJwt;

  return undefined;
}

export function getNextAuthSecretSource():
  | "NEXTAUTH_SECRET"
  | "AUTH_SECRET"
  | "SUPABASE_JWT_SECRET"
  | "invalid_NEXTAUTH_SECRET"
  | "none" {
  const explicit = process.env.NEXTAUTH_SECRET?.trim();
  if (explicit) {
    return isValidNextAuthSecret(explicit)
      ? "NEXTAUTH_SECRET"
      : "invalid_NEXTAUTH_SECRET";
  }
  if (process.env.AUTH_SECRET?.trim() && isValidNextAuthSecret(process.env.AUTH_SECRET))
    return "AUTH_SECRET";
  if (
    process.env.SUPABASE_JWT_SECRET?.trim() &&
    isValidNextAuthSecret(process.env.SUPABASE_JWT_SECRET)
  )
    return "SUPABASE_JWT_SECRET";
  return "none";
}

/**
 * URL do NextAuth: prioriza NEXTAUTH_URL definido na Vercel (ex.: fraber-maromba-hyyo.vercel.app).
 */
export function getNextAuthUrl(): string {
  const explicit = process.env.NEXTAUTH_URL?.trim();
  if (explicit) return normalizeUrl(explicit);

  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (process.env.VERCEL === "1") {
    if (process.env.VERCEL_ENV === "production" && productionDomain) {
      return normalizeUrl(productionDomain);
    }
    if (vercelUrl) return normalizeUrl(vercelUrl);
  }

  if (vercelUrl) return normalizeUrl(vercelUrl);

  return "http://localhost:3000";
}

/** Garante NEXTAUTH_URL e NEXTAUTH_SECRET válidos antes do NextAuth inicializar. */
export function applyNextAuthEnv(): void {
  process.env.NEXTAUTH_URL = getNextAuthUrl();

  const secret = getNextAuthSecret();
  if (secret) {
    process.env.NEXTAUTH_SECRET = secret;
  }
}

export function getNextAuthDiagnostics() {
  const explicitUrlRaw = process.env.NEXTAUTH_URL?.trim() ?? null;
  const explicitSecretRaw = process.env.NEXTAUTH_SECRET?.trim() ?? null;
  const effectiveUrl = getNextAuthUrl();
  const secret = getNextAuthSecret();
  const secretSource = getNextAuthSecretSource();

  return {
    hasSecret: Boolean(secret),
    secretSource,
    nextAuthSecretInvalido:
      secretSource === "invalid_NEXTAUTH_SECRET" ||
      Boolean(explicitSecretRaw && !isValidNextAuthSecret(explicitSecretRaw)),
    nextAuthUrlExplicita: explicitUrlRaw
      ? normalizeUrl(explicitUrlRaw)
      : null,
    nextAuthUrlEfetiva: effectiveUrl,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    sessionDeveFuncionar:
      Boolean(secret) && secretSource !== "invalid_NEXTAUTH_SECRET",
    configureNaVercel: {
      NEXTAUTH_URL: "https://fraber-maromba-hyyo.vercel.app",
      NEXTAUTH_SECRET:
        "gere com: openssl rand -base64 32 (NÃO use o domínio do site como secret)",
    },
  };
}
