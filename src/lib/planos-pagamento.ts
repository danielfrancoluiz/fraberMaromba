/** Helpers de UI/cliente para planos (labels estáticos de fallback). */

export const PLANOS_LABEL: Record<string, string> = {
  mensal: "Mensal",
  semestral: "Semestral",
  anual: "Anual",
  avulso: "Avulso",
  gympass: "Gympass",
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

export function labelPlano(planoId: string, nome?: string | null): string {
  return nome?.trim() || PLANOS_LABEL[planoId] || planoId;
}
