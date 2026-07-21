-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "planoId" TEXT;

-- AlterTable: pagamento de assinatura do professor não exige aluno
ALTER TABLE "Pagamento" DROP CONSTRAINT IF EXISTS "Pagamento_alunoId_fkey";
ALTER TABLE "Pagamento" ALTER COLUMN "alunoId" DROP NOT NULL;
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL ON UPDATE CASCADE;
