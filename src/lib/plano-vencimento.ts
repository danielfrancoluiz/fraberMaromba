/** Dias restantes até o vencimento (0 = vence hoje; negativo = vencido). */
export function diasRestantesPlano(
  planoVenceEm?: string | Date | null
): number | null {
  if (!planoVenceEm) return null;
  const fim = new Date(planoVenceEm);
  if (Number.isNaN(fim.getTime())) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  fim.setHours(0, 0, 0, 0);

  const diffMs = fim.getTime() - hoje.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function deveMostrarAvisoVencimento(
  planoVenceEm: string | Date | null | undefined,
  diasAviso: number
): boolean {
  const dias = diasRestantesPlano(planoVenceEm);
  if (dias === null) return false;
  return dias >= 0 && dias <= diasAviso;
}

export function planoVencido(
  planoVenceEm: string | Date | null | undefined
): boolean {
  const dias = diasRestantesPlano(planoVenceEm);
  return dias !== null && dias < 0;
}
