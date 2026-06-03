export function labelDificuldade(valor?: string | null): string {
  if (!valor) return "";
  const key = valor.trim().toLowerCase();
  const mapa: Record<string, string> = {
    iniciante: "Iniciante",
    beginner: "Iniciante",
    intermediario: "Intermediário",
    intermediate: "Intermediário",
    avancado: "Avançado",
    advanced: "Avançado",
  };
  return mapa[key] ?? valor;
}
