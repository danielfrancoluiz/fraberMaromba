import { AlunoMock } from "@/types";

// Alunos mockados para login nesta fase.
// Email e senha são usados para autenticação simulada.
// O id deve corresponder a um aluno cadastrado no localStorage
// pelo professor. Para testes, use o id do primeiro aluno cadastrado
// ou deixe fixo para demonstração.
export const alunosMock: AlunoMock[] = [
  {
    id: "aluno-mock-001",
    nome: "Carlos Silva",
    email: "carlos@fraber.com",
    senha: "123456",
  },
];

export function autenticarAluno(
  email: string,
  senha: string
): AlunoMock | null {
  return alunosMock.find(
    (a) => a.email === email && a.senha === senha
  ) ?? null;
}
