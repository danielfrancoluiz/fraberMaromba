/** Destino após contratar — usa os módulos recém-pagos (não o conjunto antigo). */
export function destinoAposModulos(modulosPagos: string[]): string {
  const set = new Set(
    modulosPagos.map((m) => m.trim().toLowerCase()).filter(Boolean)
  );

  // Um módulo só → início desse módulo.
  if (set.size === 1) {
    if (set.has("corrida")) return "/aluno/corrida";
    if (set.has("musculacao")) return "/aluno/treinos";
    if (set.has("nutricao")) return "/aluno/nutricao";
  }

  // Combo treino → início geral (ambos liberados).
  if (set.has("musculacao") && set.has("corrida")) return "/aluno/dashboard";

  if (set.has("nutricao")) return "/aluno/nutricao";
  if (set.has("corrida")) return "/aluno/corrida";
  if (set.has("musculacao")) return "/aluno/treinos";

  return "/aluno/dashboard";
}
