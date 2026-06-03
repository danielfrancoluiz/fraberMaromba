/** Mensagens em português para erros comuns de conexão (Supabase / pg). */
export function mensagemErroBanco(error: unknown): string {
  const bruto =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  const msg = bruto.toLowerCase();

  if (msg.includes("timeout exceeded") || msg.includes("connection terminated")) {
    return "Não foi possível conectar ao banco de dados. Reinicie o servidor (npm run dev) e confira DATABASE_URL no .env.local.";
  }

  if (msg.includes("28p01") || msg.includes("password authentication failed")) {
    return "Senha do banco incorreta. Atualize DATABASE_URL no .env.local (Supabase → Database).";
  }

  if (msg.includes("enotfound") || msg.includes("can't reach database server")) {
    return "Servidor do banco inacessível. Use o Session pooler (aws-1-sa-east-1.pooler.supabase.com) no .env.local.";
  }

  return bruto || "Erro ao acessar o banco de dados.";
}
