-- CreateTable
CREATE TABLE IF NOT EXISTS "OfertaPlano" (
    "id" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valorCentavos" INTEGER NOT NULL,
    "diasValidade" INTEGER NOT NULL DEFAULT 30,
    "modulos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "badge" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfertaPlano_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN IF NOT EXISTS "ofertaId" TEXT;

-- Seed inicial (promo + nutrição)
INSERT INTO "OfertaPlano" ("id", "grupo", "nome", "descricao", "valorCentavos", "diasValidade", "modulos", "ordem", "ativo", "badge", "atualizadoEm")
VALUES
  ('treino_musculacao', 'treino', 'Musculação', 'Treinos, execução e histórico de musculação', 4900, 30, ARRAY['musculacao']::TEXT[], 1, true, 'Mês promocional / inauguração', CURRENT_TIMESTAMP),
  ('treino_corrida', 'treino', 'Corrida', 'Planilhas e acompanhamento de corrida', 2900, 30, ARRAY['corrida']::TEXT[], 2, true, 'Mês promocional / inauguração', CURRENT_TIMESTAMP),
  ('treino_combo_musc_corrida', 'treino', 'Corrida + Musculação', 'Combo promocional dos dois módulos de treino', 6900, 30, ARRAY['musculacao','corrida']::TEXT[], 3, true, 'Mês promocional / inauguração', CURRENT_TIMESTAMP),
  ('nutricao_individualizada', 'nutricao', 'Nutrição individualizada', 'Individualizada e personalizada', 15000, 30, ARRAY['nutricao']::TEXT[], 10, true, NULL, CURRENT_TIMESTAMP),
  ('nutricao_emagrecimento', 'nutricao', 'Dieta de emagrecimento', 'Plano alimentar focado em emagrecimento', 3900, 30, ARRAY['nutricao']::TEXT[], 11, true, NULL, CURRENT_TIMESTAMP),
  ('nutricao_hipertrofia', 'nutricao', 'Dieta de hipertrofia', 'Plano alimentar focado em hipertrofia', 3900, 30, ARRAY['nutricao']::TEXT[], 12, true, NULL, CURRENT_TIMESTAMP),
  ('nutricao_detox_7d', 'nutricao', 'Detox — 7 dias', 'Protocolo detox de 7 dias', 1930, 7, ARRAY['nutricao']::TEXT[], 13, true, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "grupo" = EXCLUDED."grupo",
  "nome" = EXCLUDED."nome",
  "descricao" = EXCLUDED."descricao",
  "valorCentavos" = EXCLUDED."valorCentavos",
  "diasValidade" = EXCLUDED."diasValidade",
  "modulos" = EXCLUDED."modulos",
  "ordem" = EXCLUDED."ordem",
  "ativo" = EXCLUDED."ativo",
  "badge" = EXCLUDED."badge",
  "atualizadoEm" = CURRENT_TIMESTAMP;
