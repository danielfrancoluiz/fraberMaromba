/** Modelo de treino de corrida estruturado (estilo planilha / Final Surge). */

export const ACOES_CORRIDA = [
  { id: "aquecer", label: "Aquecer", emoji: "🔥" },
  { id: "correr", label: "Correr", emoji: "🏃" },
  { id: "trotar", label: "Trotar", emoji: "💨" },
  { id: "caminhar", label: "Caminhar", emoji: "🚶" },
  { id: "recuperar", label: "Recuperar", emoji: "💤" },
  { id: "desaquecer", label: "Desaquecer", emoji: "🧊" },
  { id: "livre", label: "Livre", emoji: "•" },
] as const;

export type AcaoCorridaId = (typeof ACOES_CORRIDA)[number]["id"];

export const METRICAS_CORRIDA = [
  { id: "distancia", label: "Distância" },
  { id: "tempo", label: "Tempo" },
  { id: "aberto", label: "Até se sentir pronto" },
] as const;

export type MetricaCorridaId = (typeof METRICAS_CORRIDA)[number]["id"];

export const ZONAS_CORRIDA = ["Z1", "Z2", "Z3", "Z4", "Z5"] as const;

export type PassoCorrida = {
  id: string;
  tipo: "passo";
  acao: AcaoCorridaId;
  metrica: MetricaCorridaId;
  distanciaMetros?: number;
  duracaoSegundos?: number;
  zona?: string;
  nota?: string;
  observacao?: string;
};

export type BlocoRepetirCorrida = {
  id: string;
  tipo: "repetir";
  vezes: number;
  passos: PassoCorrida[];
};

export type ItemEstruturaCorrida = PassoCorrida | BlocoRepetirCorrida;

export type EstruturaCorrida = ItemEstruturaCorrida[];

export type StatusTreinoCorrida = "planejado" | "concluido" | "cancelado";

export type TreinoCorridaDTO = {
  id: string;
  alunoId: string;
  professorId: string;
  titulo: string;
  /** YYYY-MM-DD */
  data: string;
  observacao: string | null;
  status: StatusTreinoCorrida;
  estrutura: EstruturaCorrida;
  criadoEm: string;
  atualizadoEm: string;
  alunoNome?: string;
};

export function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function passoVazio(
  acao: AcaoCorridaId = "correr",
  overrides: Partial<PassoCorrida> = {}
): PassoCorrida {
  return {
    id: novoId(),
    tipo: "passo",
    acao,
    metrica: "distancia",
    distanciaMetros: 400,
    ...overrides,
  };
}

export function blocoRepetirVazio(vezes = 6): BlocoRepetirCorrida {
  return {
    id: novoId(),
    tipo: "repetir",
    vezes,
    passos: [
      passoVazio("correr", {
        distanciaMetros: 400,
        zona: "Z3",
        nota: "Ritmo mais forte",
      }),
      passoVazio("caminhar", {
        metrica: "tempo",
        distanciaMetros: undefined,
        duracaoSegundos: 60,
        observacao: "Caminhada ou trote leve focada na técnica",
      }),
    ],
  };
}

/** Modelos prontos inspirados em planilhas de corrida. */
export const MODELOS_CORRIDA: {
  id: string;
  nome: string;
  descricao: string;
  estrutura: () => EstruturaCorrida;
}[] = [
  {
    id: "intervalado-400",
    nome: "Intervalado 400m",
    descricao: "Aquecer + 6×400m Z3 + desaquecer",
    estrutura: () => [
      passoVazio("aquecer", {
        metrica: "distancia",
        distanciaMetros: 2000,
      }),
      blocoRepetirVazio(6),
      passoVazio("desaquecer", {
        metrica: "tempo",
        distanciaMetros: undefined,
        duracaoSegundos: 300,
      }),
    ],
  },
  {
    id: "rodagem",
    nome: "Rodagem fácil",
    descricao: "Corrida contínua em Z2",
    estrutura: () => [
      passoVazio("aquecer", {
        metrica: "tempo",
        distanciaMetros: undefined,
        duracaoSegundos: 300,
      }),
      passoVazio("correr", {
        metrica: "distancia",
        distanciaMetros: 5000,
        zona: "Z2",
        nota: "Ritmo confortável",
      }),
      passoVazio("desaquecer", {
        metrica: "tempo",
        distanciaMetros: undefined,
        duracaoSegundos: 300,
      }),
    ],
  },
  {
    id: "tiros-curtos",
    nome: "Tiros curtos",
    descricao: "8×200m forte com caminhada",
    estrutura: () => [
      passoVazio("aquecer", {
        metrica: "distancia",
        distanciaMetros: 1500,
      }),
      {
        id: novoId(),
        tipo: "repetir",
        vezes: 8,
        passos: [
          passoVazio("correr", {
            distanciaMetros: 200,
            zona: "Z4",
            nota: "Forte",
          }),
          passoVazio("caminhar", {
            metrica: "tempo",
            distanciaMetros: undefined,
            duracaoSegundos: 90,
          }),
        ],
      },
      passoVazio("desaquecer", {
        metrica: "tempo",
        distanciaMetros: undefined,
        duracaoSegundos: 300,
      }),
    ],
  },
];

export function labelAcao(acao: string): string {
  return ACOES_CORRIDA.find((a) => a.id === acao)?.label ?? acao;
}

export function formatarDistancia(metros?: number): string {
  if (metros == null || metros <= 0) return "";
  if (metros >= 1000 && metros % 1000 === 0) return `${metros / 1000} km`;
  if (metros >= 1000) return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
  return `${metros} m`;
}

export function formatarDuracao(segundos?: number): string {
  if (segundos == null || segundos <= 0) return "";
  if (segundos < 60) return `${segundos}"`;
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  if (seg === 0) return `${min}'`;
  return `${min}'${String(seg).padStart(2, "0")}"`;
}

export function formatarMetricaPasso(passo: PassoCorrida): string {
  if (passo.metrica === "aberto") return "até se sentir pronto";
  if (passo.metrica === "distancia") return formatarDistancia(passo.distanciaMetros);
  return formatarDuracao(passo.duracaoSegundos);
}

export function resumoPassoLinha(passo: PassoCorrida): string {
  const acao = labelAcao(passo.acao);
  const metrica = formatarMetricaPasso(passo);
  const zona = passo.zona?.trim() ? ` ${passo.zona.trim()}` : "";
  if (!metrica) return `${acao}${zona}`;
  return `${acao} ${metrica}${zona}`;
}

/** YYYY-MM-DD no fuso local. */
export function dataISOLocal(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Data vinda do banco (@db.Date) → YYYY-MM-DD estável. */
export function dataISOFromDb(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseDataISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isAcaoCorrida(v: string): v is AcaoCorridaId {
  return ACOES_CORRIDA.some((a) => a.id === v);
}

export function isMetricaCorrida(v: string): v is MetricaCorridaId {
  return METRICAS_CORRIDA.some((m) => m.id === v);
}

function parsePasso(raw: unknown): PassoCorrida | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.tipo !== "passo") return null;
  if (typeof o.id !== "string" || typeof o.acao !== "string") return null;
  if (!isAcaoCorrida(o.acao)) return null;
  const metrica =
    typeof o.metrica === "string" && isMetricaCorrida(o.metrica)
      ? o.metrica
      : "distancia";
  return {
    id: o.id,
    tipo: "passo",
    acao: o.acao,
    metrica,
    distanciaMetros:
      typeof o.distanciaMetros === "number" ? o.distanciaMetros : undefined,
    duracaoSegundos:
      typeof o.duracaoSegundos === "number" ? o.duracaoSegundos : undefined,
    zona: typeof o.zona === "string" ? o.zona : undefined,
    nota: typeof o.nota === "string" ? o.nota : undefined,
    observacao: typeof o.observacao === "string" ? o.observacao : undefined,
  };
}

export function parseEstruturaCorrida(value: unknown): EstruturaCorrida {
  if (!Array.isArray(value)) return [];
  const out: EstruturaCorrida = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (o.tipo === "repetir") {
      if (typeof o.id !== "string") continue;
      const vezes = typeof o.vezes === "number" && o.vezes > 0 ? o.vezes : 1;
      const passosRaw = Array.isArray(o.passos) ? o.passos : [];
      const passos = passosRaw
        .map(parsePasso)
        .filter((p): p is PassoCorrida => p !== null);
      out.push({ id: o.id, tipo: "repetir", vezes, passos });
      continue;
    }
    const passo = parsePasso(item);
    if (passo) out.push(passo);
  }
  return out;
}

export function validarEstrutura(estrutura: EstruturaCorrida): string | null {
  if (estrutura.length === 0) return "Adicione ao menos um passo no treino.";
  for (const item of estrutura) {
    if (item.tipo === "repetir") {
      if (item.vezes < 1) return "Bloco de repetição precisa de ao menos 1 vez.";
      if (item.passos.length === 0) {
        return "Bloco de repetição precisa de passos internos.";
      }
    }
  }
  return null;
}

export function isStatusTreinoCorrida(v: string): v is StatusTreinoCorrida {
  return v === "planejado" || v === "concluido" || v === "cancelado";
}
