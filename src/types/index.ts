export interface Aluno {
  id: string;
  professorId: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: "masculino" | "feminino" | "outro";
  dataNascimento: string;
  peso: number;
  altura: number;
  objetivo: string;
  planoId: string;
  dataCadastro: string;
}

export interface Plano {
  id: string;
  nome: string;
}

export interface CadastroAlunoForm {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: "masculino" | "feminino" | "outro" | "";
  dataNascimento: string;
  peso: string;
  altura: string;
  objetivo: string;
  planoId: string;
}

export interface FormErrors {
  nomeCompleto?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  sexo?: string;
  dataNascimento?: string;
  peso?: string;
  altura?: string;
  objetivo?: string;
  planoId?: string;
}

export interface Exercicio {
  id: string;
  nome: string;
  series: number;
  repeticoes: number;
  observacao?: string;
  grupoMuscular?: string;
}

export interface Treino {
  id: string;
  alunoId: string;
  professorId: string;
  nome: string;
  diaSemana:
    | "segunda"
    | "terca"
    | "quarta"
    | "quinta"
    | "sexta"
    | "sabado"
    | "domingo";
  exercicios: Exercicio[];
  dataCriacao: string;
}

export interface TreinoForm {
  nome: string;
  diaSemana: Treino["diaSemana"] | "";
  exercicios: ExercicioForm[];
}

export interface ExercicioForm {
  id: string;
  nome: string;
  series: string;
  repeticoes: string;
  observacao: string;
  grupoMuscular: string;
}

export interface TreinoFormErrors {
  nome?: string;
  diaSemana?: string;
  exercicios?: { nome?: string; series?: string; repeticoes?: string }[];
}

export interface AlunoEditForm {
  nomeCompleto: string;
  email: string;
  telefone: string;
  peso: string;
  altura: string;
  objetivo: string;
  planoId: string;
}

export interface AlunoEditErrors {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  peso?: string;
  altura?: string;
  objetivo?: string;
  planoId?: string;
}

export interface TreinoTemplate {
  id: string;
  professorId: string;
  nome: string;
  descricao?: string;
  exercicios: Exercicio[];
  dataCriacao: string;
}

export interface TreinoTemplateForm {
  nome: string;
  descricao: string;
  exercicios: ExercicioForm[];
}

export interface TreinoTemplateFormErrors {
  nome?: string;
  descricao?: string;
  exercicios?: { nome?: string; series?: string; repeticoes?: string }[];
  geral?: string;
}

export interface AlunoMock {
  id: string;
  nome: string;
  email: string;
  senha: string;
}

export interface ProgressoTreino {
  treinoId: string;
  alunoId: string;
  exerciciosConcluidos: string[];
  dataUltimaAtualizacao: string;
}

export interface ExercicioSubstituto {
  id: string;
  nome: string;
  grupoMuscular: string;
  descricao?: string;
}

export interface Convite {
  id: string;
  token: string;
  professorId: string;
  email?: string;
  usado: boolean;
  dataCriacao: string;
  dataExpiracao: string;
}
