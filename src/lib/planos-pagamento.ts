/** Helpers de UI/cliente para planos (labels estáticos de fallback). */

import { labelOferta, OFERTAS_LABEL_FALLBACK } from "@/lib/ofertas-planos";

export const PLANOS_LABEL: Record<string, string> = {
  mensal: "Mensal",
  semestral: "Semestral",
  anual: "Anual",
  avulso: "Avulso",
  gympass: "Gympass",
  modulos_1: "1 módulo",
  modulos_2: "2 módulos",
  modulos_3: "3 módulos",
  ...OFERTAS_LABEL_FALLBACK,
};

export type PlanoOpcao = {
  id: string;
  nome: string;
  preco: string;
  valorCentavos?: number;
  diasValidade?: number;
  permiteCheckout?: boolean;
  ativo?: boolean;
};

/** Nome do plano: ofertas de aluno (contratação) ou planos do professor. */
export function labelPlano(planoId: string, nome?: string | null): string {
  return nome?.trim() || PLANOS_LABEL[planoId] || labelOferta(planoId) || planoId;
}
