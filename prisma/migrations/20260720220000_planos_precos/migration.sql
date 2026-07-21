-- CreateTable
CREATE TABLE IF NOT EXISTS "Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "diasValidade" INTEGER NOT NULL,
    "permiteCheckout" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- Seed inicial (idempotente)
INSERT INTO "Plano" ("id", "nome", "valorCentavos", "diasValidade", "permiteCheckout", "ativo", "ordem", "atualizadoEm")
VALUES
  ('mensal', 'Mensal', 9990, 30, true, true, 1, CURRENT_TIMESTAMP),
  ('semestral', 'Semestral', 49990, 180, true, true, 2, CURRENT_TIMESTAMP),
  ('anual', 'Anual', 89990, 365, true, true, 3, CURRENT_TIMESTAMP),
  ('avulso', 'Avulso', 2990, 1, true, true, 4, CURRENT_TIMESTAMP),
  ('gympass', 'Gympass', 0, 30, false, true, 5, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
