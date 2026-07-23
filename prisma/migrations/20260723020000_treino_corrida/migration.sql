-- CreateTable
CREATE TABLE "TreinoCorrida" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "observacao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planejado',
    "estrutura" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreinoCorrida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TreinoCorrida_alunoId_data_idx" ON "TreinoCorrida"("alunoId", "data");

-- CreateIndex
CREATE INDEX "TreinoCorrida_professorId_data_idx" ON "TreinoCorrida"("professorId", "data");

-- AddForeignKey
ALTER TABLE "TreinoCorrida" ADD CONSTRAINT "TreinoCorrida_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreinoCorrida" ADD CONSTRAINT "TreinoCorrida_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
