/** Destino após contratar um módulo. */
export function destinoAposModulos(modulos: string[]): string {
  const set = new Set(modulos.map((m) => m.trim().toLowerCase()));
  if (set.has("musculacao") && !set.has("corrida")) return "/aluno/treinos";
  if (set.has("corrida") && !set.has("musculacao")) return "/aluno/corrida";
  if (set.has("musculacao") && set.has("corrida")) return "/aluno/dashboard";
  if (set.has("nutricao")) return "/aluno/nutricao";
  return "/aluno/dashboard";
}
