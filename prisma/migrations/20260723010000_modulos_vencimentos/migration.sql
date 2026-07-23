-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN IF NOT EXISTS "modulosVencimentos" JSONB;

-- Backfill a partir de planoVenceEm + modulosAtivos
UPDATE "Aluno"
SET "modulosVencimentos" = (
  SELECT jsonb_object_agg(m, to_jsonb("planoVenceEm"::text))
  FROM unnest("modulosAtivos") AS m
)
WHERE "planoVenceEm" IS NOT NULL
  AND cardinality("modulosAtivos") > 0
  AND "modulosVencimentos" IS NULL;
