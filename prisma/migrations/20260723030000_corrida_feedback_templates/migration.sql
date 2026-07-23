-- AlterTable
ALTER TABLE "TreinoCorrida" ADD COLUMN IF NOT EXISTS "feedbackTexto" TEXT;
ALTER TABLE "TreinoCorrida" ADD COLUMN IF NOT EXISTS "feedbackNota" INTEGER;
ALTER TABLE "TreinoCorrida" ADD COLUMN IF NOT EXISTS "concluidoEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TreinoCorridaTemplate" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "estrutura" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreinoCorridaTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TreinoCorridaTemplate_professorId_idx" ON "TreinoCorridaTemplate"("professorId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "TreinoCorridaTemplate" ADD CONSTRAINT "TreinoCorridaTemplate_professorId_fkey"
    FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
