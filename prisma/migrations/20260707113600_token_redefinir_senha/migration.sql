-- CreateTable
CREATE TABLE IF NOT EXISTS "TokenRedefinirSenha" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenRedefinirSenha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TokenRedefinirSenha_token_key" ON "TokenRedefinirSenha"("token");
CREATE INDEX IF NOT EXISTS "TokenRedefinirSenha_usuarioId_idx" ON "TokenRedefinirSenha"("usuarioId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TokenRedefinirSenha_usuarioId_fkey'
  ) THEN
    ALTER TABLE "TokenRedefinirSenha"
      ADD CONSTRAINT "TokenRedefinirSenha_usuarioId_fkey"
      FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
