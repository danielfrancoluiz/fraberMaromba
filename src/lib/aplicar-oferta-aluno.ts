import { ativarAlunoAposPagamento } from "@/lib/pagamento-stripe";
import { buscarOfertaPorId } from "@/lib/ofertas-planos-server";

/**
 * Aplica oferta de aluno (mesmas do checkout): grava planoId = oferta.id
 * e libera os módulos com a validade da oferta.
 */
export async function aplicarOfertaAoAluno(
  alunoId: string,
  ofertaId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = ofertaId.trim();
  if (!id) return { ok: false, error: "Selecione um plano" };

  const oferta = await buscarOfertaPorId(id);
  if (!oferta) {
    return { ok: false, error: "Plano/oferta inválido ou inativo" };
  }

  const vence = new Date();
  vence.setDate(vence.getDate() + oferta.diasValidade);

  await ativarAlunoAposPagamento(alunoId, oferta.id, vence, oferta.modulos);
  return { ok: true };
}
