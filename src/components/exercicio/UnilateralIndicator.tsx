interface UnilateralIndicatorProps {
  unilateral: boolean;
  /** badge: só quando unilateral; chip: campo sempre visível, somente leitura */
  variant?: "badge" | "chip";
}

export function UnilateralIndicator({
  unilateral,
  variant = "badge",
}: UnilateralIndicatorProps) {
  if (variant === "badge") {
    if (!unilateral) return null;
    return <span className="exercicio-badge-unilateral">Unilateral</span>;
  }

  return (
    <div className="exercicio-unilateral-wrap">
      <span
        className={`chip exercicio-unilateral-btn exercicio-unilateral-readonly${unilateral ? " chip-active" : ""}`}
        aria-label={unilateral ? "Exercício unilateral" : "Exercício bilateral"}
      >
        Unilateral
      </span>
      <p className="text-muted exercicio-unilateral-hint">
        {unilateral
          ? "Execute um lado de cada vez."
          : "Execute dos dois lados ou com ambos simultaneamente."}
      </p>
    </div>
  );
}
