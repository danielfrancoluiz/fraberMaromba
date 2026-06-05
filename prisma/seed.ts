const { PrismaClient } = require("@prisma/client");
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { EXERCICIOS_CATALOGO_SEED } from "./data/exercicios-catalogo";

const pool = new Pool({
  connectionString:
    process.env.DIRECT_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed...");

  // Limpa dados existentes na ordem correta (filhos antes dos pais)
  await prisma.treinoSessaoSerie.deleteMany();
  await prisma.treinoSessao.deleteMany();
  await prisma.exercicio.deleteMany();
  await prisma.treino.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.medicaoFisica.deleteMany();
  await prisma.exercicioTemplate.deleteMany();
  await prisma.treinoTemplate.deleteMany();
  await prisma.exercicioCatalogo.deleteMany();
  await prisma.convite.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("Populando catálogo de exercícios...");
  await prisma.exercicioCatalogo.createMany({
    data: EXERCICIOS_CATALOGO_SEED.map((item) => ({
      nome: item.nome,
      slug: item.slug,
      grupoMuscular: item.grupoMuscular,
      equipamento: item.equipamento ?? null,
      dificuldade: item.dificuldade ?? null,
      descricao: item.descricao ?? null,
      gifUrl: item.gifUrl,
      imagemUrl: item.imagemUrl,
      ativo: true,
    })),
    skipDuplicates: true,
  });

  const senhaProfessor = await bcrypt.hash("123456", 12);
  const senhaAluno = await bcrypt.hash("123456", 12);

  // Cria professor
  const professor = await prisma.usuario.create({
    data: {
      id: "prof-001",
      nome: "Ricardo Fraber",
      email: "ricardo@fraber.com",
      senha: senhaProfessor,
      role: "professor",
      status: "ativo_plataforma",
    },
  });

  // Cria usuário aluno
  const usuarioAluno = await prisma.usuario.create({
    data: {
      id: "aluno-user-001",
      nome: "Carlos Silva",
      email: "carlos@fraber.com",
      senha: senhaAluno,
      role: "aluno",
      status: "ativo_professor",
    },
  });

  // Cria registro aluno vinculado ao professor e usuário
  const aluno = await prisma.aluno.create({
    data: {
      id: "aluno-001",
      usuarioId: usuarioAluno.id,
      professorId: professor.id,
      nomeCompleto: "Carlos Silva",
      cpf: "123.456.789-00",
      email: "carlos@fraber.com",
      telefone: "(31) 99999-9999",
      sexo: "masculino",
      dataNascimento: "1995-06-15",
      peso: 80,
      altura: 178,
      objetivo: "Hipertrofia muscular",
      planoId: "mensal",
      status: "ativo_professor",
    },
  });

  // Cria treinos mock para o aluno
  await prisma.treino.create({
    data: {
      id: "treino-mock-001",
      alunoId: aluno.id,
      professorId: professor.id,
      nome: "Treino A - Peito e Tríceps",
      diaSemana: "segunda",
      exercicios: {
        create: [
          { nome: "Supino Reto", series: 4, repeticoes: 12,
            grupoMuscular: "Peito", observacao: "Descanso de 60s", ordem: 1 },
          { nome: "Crucifixo", series: 3, repeticoes: 15,
            grupoMuscular: "Peito", ordem: 2 },
          { nome: "Tríceps Pulley", series: 4, repeticoes: 12,
            grupoMuscular: "Tríceps", observacao: "Manter cotovelo fixo", ordem: 3 },
          { nome: "Tríceps Testa", series: 3, repeticoes: 10,
            grupoMuscular: "Tríceps", ordem: 4 },
        ],
      },
    },
  });

  await prisma.treino.create({
    data: {
      id: "treino-mock-002",
      alunoId: aluno.id,
      professorId: professor.id,
      nome: "Treino B - Costas e Bíceps",
      diaSemana: "quarta",
      exercicios: {
        create: [
          { nome: "Puxada Frontal", series: 4, repeticoes: 12,
            grupoMuscular: "Costas", ordem: 1 },
          { nome: "Remada Curvada", series: 4, repeticoes: 10,
            grupoMuscular: "Costas", observacao: "Manter coluna reta", ordem: 2 },
          { nome: "Rosca Direta", series: 3, repeticoes: 12,
            grupoMuscular: "Bíceps", ordem: 3 },
          { nome: "Rosca Martelo", series: 3, repeticoes: 12,
            grupoMuscular: "Bíceps", ordem: 4 },
        ],
      },
    },
  });

  await prisma.treino.create({
    data: {
      id: "treino-mock-003",
      alunoId: aluno.id,
      professorId: professor.id,
      nome: "Treino C - Pernas",
      diaSemana: "sexta",
      exercicios: {
        create: [
          { nome: "Agachamento", series: 4, repeticoes: 12,
            grupoMuscular: "Pernas", observacao: "Descanso de 90s", ordem: 1 },
          { nome: "Leg Press", series: 4, repeticoes: 15,
            grupoMuscular: "Pernas", ordem: 2 },
          { nome: "Cadeira Extensora", series: 3, repeticoes: 15,
            grupoMuscular: "Pernas", ordem: 3 },
          { nome: "Cadeira Flexora", series: 3, repeticoes: 15,
            grupoMuscular: "Pernas", ordem: 4 },
        ],
      },
    },
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
