-- Conjugado por exercício no treino (e template): avança ao próximo sem descanso/lista.
ALTER TABLE "Exercicio" ADD COLUMN IF NOT EXISTS "exercicioContinuo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ExercicioTemplate" ADD COLUMN IF NOT EXISTS "exercicioContinuo" BOOLEAN NOT NULL DEFAULT false;
