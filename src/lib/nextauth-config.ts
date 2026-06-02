/** Secret para JWT do NextAuth (Vercel: defina NEXTAUTH_SECRET ou use fallback da integração Supabase). */
export function getNextAuthSecret(): string | undefined {
  return (
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.SUPABASE_JWT_SECRET?.trim() ||
    undefined
  );
}

export function getNextAuthSecretSource():
  | "NEXTAUTH_SECRET"
  | "AUTH_SECRET"
  | "SUPABASE_JWT_SECRET"
  | "none" {
  if (process.env.NEXTAUTH_SECRET?.trim()) return "NEXTAUTH_SECRET";
  if (process.env.AUTH_SECRET?.trim()) return "AUTH_SECRET";
  if (process.env.SUPABASE_JWT_SECRET?.trim()) return "SUPABASE_JWT_SECRET";
  return "none";
}

export function getVercelAppUrl(): string | null {
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (!vercelUrl) return null;
  return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
}

export function getNextAuthDiagnostics() {
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() ?? null;
  const vercelAppUrl = getVercelAppUrl();
  const secret = getNextAuthSecret();

  return {
    hasSecret: Boolean(secret),
    secretSource: getNextAuthSecretSource(),
    nextAuthUrl,
    vercelAppUrl,
    urlAlinhada:
      Boolean(nextAuthUrl && vercelAppUrl) && nextAuthUrl === vercelAppUrl,
    urlRecomendada: vercelAppUrl ?? "https://fraber-maromba-hyyo.vercel.app",
  };
}
