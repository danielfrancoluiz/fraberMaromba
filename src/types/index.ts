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
  modulosAtivos?: string[];
  planoVenceEm?: string | null;
  dataCadastro: string;
}

export interface Plano {
  id: string;
  nome: string;
  preco?: string;
  valorCentavos?: number;
  diasValidade?: number;
  permiteCheckout?: boolean;
  ativo?: boolean;
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

export interface ExercicioCatalogo {
  id: string;
  professorId?: string | null;
  nome: string;
  slug: string;
  grupoMuscular: string;
  subGrupoMuscular?: string | null;
  equipamento?: string | null;
  dificuldade?: string | null;
  descricao?: string | null;
  gifUrl?: string | null;
  imagemUrl?: string | null;
  seriesPadrao?: number;
  repeticoesPadrao?: number;
  descansoPadrao?: number;
  unilateral?: boolean;
  ativo: boolean;
  criadoEm?: string;
}

export interface CriarExercicioForm {
  nome: string;
  gifUrl: string;
  grupoMuscular: string;
  subGrupoMuscular: string;
  series: string;
  repeticoes: string;
  descanso: string;
  unilateral: boolean;
}

export interface CriarExercicioFormErrors {
  nome?: string;
  gifUrl?: string;
  grupoMuscular?: string;
  subGrupoMuscular?: string;
  series?: string;
  repeticoes?: string;
  descanso?: string;
}

export interface Exercicio {
  id: string;
  nome: string;
  series: number;
  repeticoes: number;
  /** Ex.: [12, 10, 8]. Vazio/ausente = todas as séries usam `repeticoes`. */
  repeticoesPorSerie?: number[];
  observacao?: string;
  grupoMuscular?: string;
  exercicioCatalogoId?: string;
  imagemUrl?: string;
  gifUrl?: string;
  descricao?: string;
  equipamento?: string;
  dificuldade?: string;
  restSeconds?: number;
  unilateral?: boolean;
}

export interface TreinoComAluno extends Treino {
  alunoNome?: string;
}

export interface Treino {
  id: string;
  alunoId: string;
  professorId: string;
  nome: string;
  descricao?: string;
  objetivo?: string;
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
  descricao: string;
  objetivo: string;
  diaSemana: Treino["diaSemana"] | "";
  exercicios: ExercicioForm[];
}

export type ModoSeriesForm = "iguais" | "decrescente";

export interface ExercicioForm {
  id: string;
  nome: string;
  series: string;
  repeticoes: string;
  restSeconds: string;
  observacao: string;
  grupoMuscular: string;
  /** Normal (padrão) ou pirâmide com reps por série. */
  modoSeries: ModoSeriesForm;
  /** @deprecated mantido por compatibilidade de formulário */
  passoDecrescente: string;
  /** Reps de cada série no modo pirâmide. */
  repeticoesPorSerie?: number[];
  exercicioCatalogoId?: string;
  imagemUrl?: string;
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

/** @deprecated Substituído por TreinoSessao no banco */
export interface ProgressoTreino {
  treinoId: string;
  alunoId: string;
  exerciciosConcluidos: string[];
  dataUltimaAtualizacao: string;
}

export type StatusSessaoTreino = "em_andamento" | "concluido" | "cancelado";

export interface TreinoSessaoSerie {
  id: string;
  exercicioId: string;
  numeroSerie: number;
  concluida: boolean;
  substitutoCatalogoId: string | null;
}

export interface CatalogoResumoSessao {
  id: string;
  nome: string;
  grupoMuscular: string;
  imagemUrl?: string | null;
  gifUrl?: string | null;
  descricao?: string | null;
  equipamento?: string | null;
  dificuldade?: string | null;
  unilateral?: boolean;
}

export interface TreinoSessao {
  id: string;
  treinoId: string;
  alunoId: string;
  iniciadoEm: string;
  finalizadoEm: string | null;
  duracaoSegundos: number | null;
  status: StatusSessaoTreino;
  treinoNome: string;
  treinoDiaSemana: string;
  series: TreinoSessaoSerie[];
  catalogoPorId?: Record<string, CatalogoResumoSessao>;
}

export interface EstatisticasSessaoAluno {
  treinosConcluidos: number;
  minutosTotais: number;
  planosAtivos: number;
  planoId: string | null;
  ultimasSessoes: Array<{
    id: string;
    treinoId: string;
    treinoNome: string;
    treinoDiaSemana: string;
    finalizadoEm: string | null;
    duracaoSegundos: number | null;
  }>;
}

export interface EstatisticasSessaoProfessor {
  treinosConcluidos: number;
  minutosTotais: number;
  sessoesEmAndamento?: number;
}

export interface ExercicioSubstituto {
  id: string;
  nome: string;
  grupoMuscular: string;
  descricao?: string;
  equipamento?: string;
  dificuldade?: string;
  imagemUrl?: string;
  gifUrl?: string;
  slug?: string;
  unilateral?: boolean;
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
