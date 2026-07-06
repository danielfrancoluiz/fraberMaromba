-- AlterTable
ALTER TABLE "ExercicioCatalogo" ADD COLUMN IF NOT EXISTS "professorId" TEXT;
ALTER TABLE "ExercicioCatalogo" ADD COLUMN IF NOT EXISTS "subGrupoMuscular" TEXT;
ALTER TABLE "ExercicioCatalogo" ADD COLUMN IF NOT EXISTS "seriesPadrao" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "ExercicioCatalogo" ADD COLUMN IF NOT EXISTS "repeticoesPadrao" INTEGER NOT NULL DEFAULT 12;
ALTER TABLE "ExercicioCatalogo" ADD COLUMN IF NOT EXISTS "descansoPadrao" INTEGER NOT NULL DEFAULT 60;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ExercicioCatalogo_professorId_fkey'
  ) THEN
    ALTER TABLE "ExercicioCatalogo"
      ADD CONSTRAINT "ExercicioCatalogo_professorId_fkey"
      FOREIGN KEY ("professorId") REFERENCES "Usuario"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
