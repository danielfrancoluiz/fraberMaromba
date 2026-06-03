/**
 * Popula apenas ExercicioCatalogo (não apaga usuários/treinos).
 * Uso: node prisma/seed-catalogo.cjs
 */
require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

process.env.TS_NODE_SKIP_PROJECT = "1";
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: "CommonJS",
  moduleResolution: "node",
  target: "ES2020",
});

require("ts-node/register/transpile-only");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const { EXERCICIOS_CATALOGO_SEED } = require("./data/exercicios-catalogo.ts");

const pool = new Pool({
  connectionString:
    process.env.DIRECT_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Sincronizando catálogo de exercícios...");
  let criados = 0;
  let atualizados = 0;

  for (const item of EXERCICIOS_CATALOGO_SEED) {
    const existente = await prisma.exercicioCatalogo.findUnique({
      where: { slug: item.slug },
    });

    if (existente) {
      await prisma.exercicioCatalogo.update({
        where: { slug: item.slug },
        data: {
          nome: item.nome,
          grupoMuscular: item.grupoMuscular,
          equipamento: item.equipamento ?? null,
          dificuldade: item.dificuldade ?? null,
          descricao: item.descricao ?? null,
          gifUrl: item.gifUrl,
          imagemUrl: item.imagemUrl,
          ativo: true,
        },
      });
      atualizados += 1;
    } else {
      await prisma.exercicioCatalogo.create({
        data: {
          nome: item.nome,
          slug: item.slug,
          grupoMuscular: item.grupoMuscular,
          equipamento: item.equipamento ?? null,
          dificuldade: item.dificuldade ?? null,
          descricao: item.descricao ?? null,
          gifUrl: item.gifUrl,
          imagemUrl: item.imagemUrl,
          ativo: true,
        },
      });
      criados += 1;
    }
  }

  console.log(`Catálogo: ${criados} criados, ${atualizados} atualizados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
