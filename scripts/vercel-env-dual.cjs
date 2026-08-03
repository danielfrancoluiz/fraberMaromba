/**
 * Sincroniza envs separados para Preview/Dev e Production na Vercel.
 *
 * Uso:
 *   1. `.env.local`           → banco DEV (Preview + Development)
 *   2. `.env.production.local` → banco PRD (só Production)
 *   3. node scripts/vercel-env-dual.cjs
 *
 * Projeto Vercel atual (link): fraber-maromba-hyyo (www.fraber360.com.br)
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const DEV_URL = "https://dev.fraber360.com.br";
const PRD_URL = "https://www.fraber360.com.br";

/** Variáveis de banco/auth que mudam por ambiente. */
const DUAL_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "NEXTAUTH_URL",
];

/** Copiadas iguais para Preview + Production (se existirem no arquivo). */
const SHARED_KEYS = [
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function addEnv(name, value, environment) {
  if (!value) {
    console.warn(`  skip ${name} (${environment}): vazio`);
    return;
  }
  try {
    execSync(`npx vercel env add ${name} ${environment} --force --yes`, {
      input: `${value}\n`,
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8",
    });
    console.log(`  ok ${name} [${environment}]`);
  } catch (err) {
    const msg = err.stderr?.toString() || err.message;
    console.error(`  erro ${name} [${environment}]: ${msg.trim().slice(0, 200)}`);
    process.exitCode = 1;
  }
}

const devEnv = parseEnvFile(path.join(ROOT, ".env.local"));
const prdEnv = parseEnvFile(path.join(ROOT, ".env.production.local"));

if (!devEnv) {
  console.error("Falta .env.local (DEV).");
  process.exit(1);
}
if (!prdEnv) {
  console.error(
    "Falta .env.production.local (PRD).\n" +
      "Copie de .env.production.local.example e preencha com o projeto zdtqfvvlqpwoiigbuikl."
  );
  process.exit(1);
}

console.log("Projeto Vercel linkado (vercel link) — sincronizando envs dual...\n");

console.log("=== Preview + Development (DEV) ===");
for (const key of DUAL_KEYS) {
  let value = devEnv[key];
  if (key === "NEXTAUTH_URL") value = DEV_URL;
  addEnv(key, value, "preview");
  if (key === "NEXTAUTH_URL") {
    addEnv(key, "http://localhost:3000", "development");
  } else {
    addEnv(key, value, "development");
  }
}

console.log("\n=== Production (PRD) ===");
for (const key of DUAL_KEYS) {
  let value = prdEnv[key];
  if (key === "NEXTAUTH_URL") value = PRD_URL;
  addEnv(key, value, "production");
}

console.log("\n=== Shared (Preview + Production) ===");
for (const key of SHARED_KEYS) {
  const value = prdEnv[key] || devEnv[key];
  if (!value) continue;
  addEnv(key, value, "preview");
  addEnv(key, value, "production");
}

console.log("\nPronto.");
console.log("1) No PRD: npx dotenv -e .env.production.local -- npx prisma migrate deploy");
console.log("2) Redeploy Preview (branch dev) e Production (branch main) na Vercel.");
