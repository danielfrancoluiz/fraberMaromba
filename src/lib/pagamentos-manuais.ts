/**
 * Quando true, Stripe checkout fica pausado (PIX / liberação manual).
 * Ative com NEXT_PUBLIC_PAGAMENTOS_MANUAIS=1 no .env / Vercel.
 * Para voltar o cartão: remova a env ou use =0.
 */
export function pagamentosManuaisAtivos(): boolean {
  const v = process.env.NEXT_PUBLIC_PAGAMENTOS_MANUAIS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "sim";
}

export const MSG_PAGAMENTO_PIX =
  "Pague via PIX com o professor, após a confirmação, o acesso é liberado.";
