/**
 * Sincroniza variáveis do .env.local para a Vercel (production, preview, development).
 * Uso: node scripts/vercel-env-sync.cjs
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

const PRODUCTION_URL = "https://fraber-maromba.vercel.app";

const SKIP = new Set([
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_DEV_SEED_PASSWORD",
]);

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
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
    console.warn(`  skip ${name} (${environment}): valor vazio`);
    return;
  }
  try {
    execSync(`npx vercel env add ${name} ${environment} --force`, {
      input: value,
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8",
    });
    console.log(`  ok ${name} [${environment}]`);
  } catch (err) {
    const msg = err.stderr?.toString() || err.message;
    console.error(`  erro ${name} [${environment}]: ${msg.trim()}`);
    process.exitCode = 1;
  }
}

const local = parseEnvFile(path.join(process.cwd(), ".env.local"));
const environments = ["production", "preview", "development"];

const vars = {
  ...local,
  NEXTAUTH_URL: PRODUCTION_URL,
};

console.log("Sincronizando env para fraber-maromba na Vercel...\n");

for (const [name, value] of Object.entries(vars)) {
  if (SKIP.has(name)) continue;
  if (name.startsWith("#")) continue;
  for (const env of environments) {
    const envValue =
      name === "NEXTAUTH_URL" && env === "development"
        ? local.NEXTAUTH_URL || "http://localhost:3000"
        : value;
    addEnv(name, envValue, env);
  }
}

console.log("\nConcluído. Rode: npx vercel deploy --prod --yes");
