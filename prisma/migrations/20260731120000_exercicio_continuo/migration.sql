-- Exercício contínuo: pula a tela de descanso na execução.
ALTER TABLE "ExercicioCatalogo" ADD COLUMN IF NOT EXISTS "exercicioContinuo" BOOLEAN NOT NULL DEFAULT false;
