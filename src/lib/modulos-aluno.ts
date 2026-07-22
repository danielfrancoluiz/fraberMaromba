/** Módulos pagos do aluno. */
export const MODULOS_ALUNO = [
  {
    id: "musculacao",
    label: "Musculação",
    descricao: "Treinos, execução e histórico de musculação",
    href: "/aluno/treinos",
  },
  {
    id: "corrida",
    label: "Corrida",
    descricao: "Planilhas e acompanhamento de corrida",
    href: "/aluno/corrida",
  },
  {
    id: "nutricao",
    label: "Nutrição",
    descricao: "Orientação e acompanhamento nutricional",
    href: "/aluno/nutricao",
  },
] as const;

export type ModuloAlunoId = (typeof MODULOS_ALUNO)[number]["id"];

export const MODULO_IDS: ModuloAlunoId[] = MODULOS_ALUNO.map((m) => m.id);

export function isModuloAlunoId(value: string): value is ModuloAlunoId {
  return (MODULO_IDS as string[]).includes(value);
}

export function normalizarModulos(modulos: string[]): ModuloAlunoId[] {
  const unicos = new Set<ModuloAlunoId>();
  for (const m of modulos) {
    const id = m.trim().toLowerCase();
    if (isModuloAlunoId(id)) unicos.add(id);
  }
  return MODULO_IDS.filter((id) => unicos.has(id));
}

export function labelModulo(id: string): string {
  return MODULOS_ALUNO.find((m) => m.id === id)?.label ?? id;
}

export function labelsModulos(modulos: string[]): string {
  const labels = normalizarModulos(modulos).map(labelModulo);
  if (labels.length === 0) return "Nenhum";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} e ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

/** Preços padrão (centavos) por quantidade de módulos — espelha o seed do banco. */
export const PRECOS_MODULOS_PADRAO: Record<1 | 2 | 3, number> = {
  1: 1990,
  2: 2990,
  3: 3990,
};

export const DIAS_VALIDADE_MODULOS = 30;

export function planoIdPorQuantidade(qtd: number): string {
  return `modulos_${qtd}`;
}
