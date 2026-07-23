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

export type ModulosVencimentos = Partial<Record<ModuloAlunoId, string>>;

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

export function parseModulosVencimentos(value: unknown): ModulosVencimentos {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: ModulosVencimentos = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!isModuloAlunoId(key)) continue;
    if (typeof raw === "string" && raw.trim()) {
      out[key] = raw;
      continue;
    }
    if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
      out[key] = raw.toISOString();
    }
  }
  return out;
}

function inicioDoDia(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function moduloVigente(
  venceEm?: string | null,
  agora = new Date()
): boolean {
  if (!venceEm) return false;
  const fim = new Date(venceEm);
  if (Number.isNaN(fim.getTime())) return false;
  return inicioDoDia(fim).getTime() >= inicioDoDia(agora).getTime();
}

/** Módulos ainda dentro do período mensal. */
export function modulosVigentes(
  vencimentos: ModulosVencimentos | null | undefined,
  agora = new Date()
): ModuloAlunoId[] {
  const map = vencimentos ?? {};
  return MODULO_IDS.filter((id) => moduloVigente(map[id], agora));
}

/** Menor data de vencimento entre os módulos vigentes (para aviso no dashboard). */
export function menorVencimentoVigente(
  vencimentos: ModulosVencimentos | null | undefined
): string | undefined {
  const vigentes = modulosVigentes(vencimentos);
  let menor: Date | null = null;
  for (const id of vigentes) {
    const raw = vencimentos?.[id];
    if (!raw) continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    if (!menor || d.getTime() < menor.getTime()) menor = d;
  }
  return menor?.toISOString();
}

export function mesclarVencimentosModulos(
  atuais: ModulosVencimentos,
  novosModulos: string[],
  novoVenceEm: Date
): ModulosVencimentos {
  const next: ModulosVencimentos = { ...atuais };
  const iso = novoVenceEm.toISOString();
  for (const id of normalizarModulos(novosModulos)) {
    next[id] = iso;
  }
  return next;
}

export function precoPorModuloCentavos(
  qtd: 1 | 2 | 3,
  totalCentavos: number
): number {
  return Math.round(totalCentavos / qtd);
}
