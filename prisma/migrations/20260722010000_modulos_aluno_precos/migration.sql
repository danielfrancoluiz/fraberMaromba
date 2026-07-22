-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN IF NOT EXISTS "modulosAtivos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN IF NOT EXISTS "modulos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE IF NOT EXISTS "PrecoPacoteModulos" (
    "quantidade" INTEGER NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "diasValidade" INTEGER NOT NULL DEFAULT 30,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrecoPacoteModulos_pkey" PRIMARY KEY ("quantidade")
);

INSERT INTO "PrecoPacoteModulos" ("quantidade", "valorCentavos", "diasValidade", "ativo", "atualizadoEm")
VALUES
  (1, 1990, 30, true, CURRENT_TIMESTAMP),
  (2, 2990, 30, true, CURRENT_TIMESTAMP),
  (3, 3990, 30, true, CURRENT_TIMESTAMP)
ON CONFLICT ("quantidade") DO UPDATE SET
  "valorCentavos" = EXCLUDED."valorCentavos",
  "diasValidade" = EXCLUDED."diasValidade",
  "ativo" = true,
  "atualizadoEm" = CURRENT_TIMESTAMP;
