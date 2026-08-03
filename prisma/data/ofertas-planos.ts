/**
 * Catálogo seed de ofertas de aluno — fonte inicial do banco.
 * Usado em: contratação (`OfertasContratar`), cadastro/edição de aluno,
 * e painel Planos → Ofertas. Depois do seed, edições no painel do professor
 * prevalecem no banco (`/api/ofertas`).
 *
 * Valores em centavos (4900 = R$ 49,00).
 */
export type OfertaGrupo = "treino" | "nutricao";

export type OfertaPlanoSeed = {
  id: string;
  grupo: OfertaGrupo;
  nome: string;
  descricao: string;
  valorCentavos: number;
  diasValidade: number;
  /** Módulos de acesso liberados após o pagamento. */
  modulos: string[];
  ordem: number;
  ativo: boolean;
  badge?: string | null;
};

export const FORMULARIO_NUTRICAO_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdtlJsrjEOMmIrqNbjzEQztI2PD4Q18awk5kG1Tg6OnoJWnyA/viewform?embedded=true";

export const FORMULARIO_NUTRICAO_URL_ABRIR =
  "https://docs.google.com/forms/d/e/1FAIpQLSdtlJsrjEOMmIrqNbjzEQztI2PD4Q18awk5kG1Tg6OnoJWnyA/viewform";

export const OFERTAS_PLANOS_PADRAO: OfertaPlanoSeed[] = [
  {
    id: "treino_musculacao",
    grupo: "treino",
    nome: "Musculação",
    descricao: "Treinos, execução e histórico de musculação",
    valorCentavos: 4900,
    diasValidade: 30,
    modulos: ["musculacao"],
    ordem: 1,
    ativo: true,
    badge: "Mês promocional / inauguração",
  },
  {
    id: "treino_corrida",
    grupo: "treino",
    nome: "Corrida",
    descricao: "Planilhas e acompanhamento de corrida",
    valorCentavos: 2900,
    diasValidade: 30,
    modulos: ["corrida"],
    ordem: 2,
    ativo: true,
    badge: "Mês promocional / inauguração",
  },
  {
    id: "treino_combo_musc_corrida",
    grupo: "treino",
    nome: "Corrida + Musculação",
    descricao: "Combo promocional dos dois módulos de treino",
    valorCentavos: 6900,
    diasValidade: 30,
    modulos: ["musculacao", "corrida"],
    ordem: 3,
    ativo: true,
    badge: "Mês promocional / inauguração",
  },
  {
    id: "nutricao_individualizada",
    grupo: "nutricao",
    nome: "Nutrição individualizada",
    descricao: "Individualizada e personalizada",
    valorCentavos: 15000,
    diasValidade: 30,
    modulos: ["nutricao"],
    ordem: 10,
    ativo: true,
    badge: null,
  },
  {
    id: "nutricao_emagrecimento",
    grupo: "nutricao",
    nome: "Dieta de emagrecimento",
    descricao: "Plano alimentar focado em emagrecimento",
    valorCentavos: 3900,
    diasValidade: 30,
    modulos: ["nutricao"],
    ordem: 11,
    ativo: true,
    badge: null,
  },
  {
    id: "nutricao_hipertrofia",
    grupo: "nutricao",
    nome: "Dieta de hipertrofia",
    descricao: "Plano alimentar focado em hipertrofia",
    valorCentavos: 3900,
    diasValidade: 30,
    modulos: ["nutricao"],
    ordem: 12,
    ativo: true,
    badge: null,
  },
  {
    id: "nutricao_detox_7d",
    grupo: "nutricao",
    nome: "Detox — 7 dias",
    descricao: "Protocolo detox de 7 dias",
    valorCentavos: 1930,
    diasValidade: 7,
    modulos: ["nutricao"],
    ordem: 13,
    ativo: true,
    badge: null,
  },
];
