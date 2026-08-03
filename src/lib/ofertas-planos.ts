/** Tipos, labels e helpers client-safe para ofertas de aluno (sem Prisma). */

import { OFERTAS_PLANOS_PADRAO } from "../../prisma/data/ofertas-planos";

export type OfertaGrupo = "treino" | "nutricao";

export type OfertaPlano = {
  id: string;
  grupo: OfertaGrupo;
  nome: string;
  descricao: string | null;
  valorCentavos: number;
  diasValidade: number;
  modulos: string[];
  ordem: number;
  ativo: boolean;
  badge: string | null;
};

export const FORMULARIO_NUTRICAO_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdtlJsrjEOMmIrqNbjzEQztI2PD4Q18awk5kG1Tg6OnoJWnyA/viewform?embedded=true";

export const FORMULARIO_NUTRICAO_URL_ABRIR =
  "https://docs.google.com/forms/d/e/1FAIpQLSdtlJsrjEOMmIrqNbjzEQztI2PD4Q18awk5kG1Tg6OnoJWnyA/viewform";

/** Fallback de nomes a partir do seed (runtime usa `/api/ofertas`). */
export const OFERTAS_LABEL_FALLBACK: Record<string, string> = Object.fromEntries(
  OFERTAS_PLANOS_PADRAO.map((o) => [o.id, o.nome])
);

export function formatarPrecoCentavos(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

export function labelValidadeOferta(dias: number): string {
  if (dias === 30) return " / mês";
  return ` / ${dias} dias`;
}

/** Resumo "Nome R$ X · Nome R$ Y" a partir das ofertas do banco. */
export function resumoOfertas(
  ofertas: { nome: string; valorCentavos: number }[]
): string {
  return ofertas
    .map((o) => `${o.nome} ${formatarPrecoCentavos(o.valorCentavos)}`)
    .join(" · ");
}

export function labelOferta(ofertaId: string, nome?: string | null): string {
  return nome?.trim() || OFERTAS_LABEL_FALLBACK[ofertaId] || ofertaId;
}

export function labelOpcaoOferta(
  oferta: Pick<OfertaPlano, "nome" | "valorCentavos" | "diasValidade">
): string {
  return `${oferta.nome} — ${formatarPrecoCentavos(oferta.valorCentavos)}${labelValidadeOferta(oferta.diasValidade)}`;
}

export function labelGrupoOferta(grupo: OfertaGrupo): string {
  return grupo === "nutricao" ? "Nutrição" : "Treino";
}
