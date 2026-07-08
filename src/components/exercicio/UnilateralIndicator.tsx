interface UnilateralIndicatorProps {
  unilateral: boolean;
}

/** Exibe badge "Unilateral" somente quando o exercício está marcado como unilateral. */
export function UnilateralIndicator({ unilateral }: UnilateralIndicatorProps) {
  if (!unilateral) return null;
  return <span className="exercicio-badge-unilateral">Unilateral</span>;
}
