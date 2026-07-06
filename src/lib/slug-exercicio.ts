export function slugifyExercicio(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

export function slugExercicioUnico(nome: string, sufixo?: string): string {
  const base = slugifyExercicio(nome) || "exercicio";
  const extra = sufixo ?? crypto.randomUUID().slice(0, 8);
  return `${base}_${extra}`;
}
