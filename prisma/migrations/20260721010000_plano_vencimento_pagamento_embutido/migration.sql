-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "planoVenceEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN IF NOT EXISTS "planoVenceEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Pagamento_stripePaymentIntentId_key" ON "Pagamento"("stripePaymentIntentId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "ConfigApp" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "diasAvisoVencimento" INTEGER NOT NULL DEFAULT 5,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigApp_pkey" PRIMARY KEY ("id")
);

-- Seed config padrão
INSERT INTO "ConfigApp" ("id", "diasAvisoVencimento", "atualizadoEm")
VALUES ('default', 5, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
