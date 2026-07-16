-- AlterTable
ALTER TABLE "Exercicio" ADD COLUMN IF NOT EXISTS "repeticoesPorSerie" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "ExercicioTemplate" ADD COLUMN IF NOT EXISTS "repeticoesPorSerie" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
