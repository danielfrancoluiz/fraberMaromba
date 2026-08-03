import { Exercicio, ExercicioCatalogo, ExercicioForm, ModoSeriesForm } from "@/types";
import { labelGrupoMuscular, normalizarGrupoMuscular } from "@/lib/grupos-musculares";

export function criarExercicioFormVazio(): ExercicioForm {
  return {
    id: crypto.randomUUID(),
    nome: "",
    series: "3",
    repeticoes: "12",
    restSeconds: "60",
    observacao: "",
    grupoMuscular: "",
    modoSeries: "iguais",
    passoDecrescente: "2",
    exercicioContinuo: false,
  };
}

function modoFromPrescricao(
  series: number,
  porSerie?: number[] | null
): { modoSeries: ModoSeriesForm; repeticoesPorSerie?: number[] } {
  if (porSerie && porSerie.length === series && porSerie.length > 0) {
    return {
      modoSeries: "decrescente",
      repeticoesPorSerie: porSerie,
    };
  }
  return { modoSeries: "iguais" };
}

export function exercicioFormFromExercicio(ex: Exercicio): ExercicioForm {
  const modo = modoFromPrescricao(ex.series, ex.repeticoesPorSerie);
  const continuo = ex.exercicioContinuo === true;
  return {
    id: ex.id,
    exercicioCatalogoId: ex.exercicioCatalogoId,
    nome: ex.nome,
    series: String(ex.series),
    repeticoes: String(
      modo.modoSeries === "decrescente" && modo.repeticoesPorSerie
        ? modo.repeticoesPorSerie[0]
        : ex.repeticoes
    ),
    restSeconds: String(continuo ? 0 : (ex.restSeconds ?? 60)),
    observacao: ex.observacao ?? "",
    grupoMuscular: ex.grupoMuscular ?? "",
    imagemUrl: ex.imagemUrl ?? ex.gifUrl,
    passoDecrescente: "2",
    exercicioContinuo: continuo,
    ...modo,
  };
}

export function exercicioFormFromCatalogo(item: ExercicioCatalogo): ExercicioForm {
  const continuo = item.exercicioContinuo === true;
  return {
    id: crypto.randomUUID(),
    exercicioCatalogoId: item.id,
    nome: item.nome,
    series: String(item.seriesPadrao ?? 3),
    repeticoes: String(item.repeticoesPadrao ?? 12),
    restSeconds: String(continuo ? 0 : (item.descansoPadrao ?? 60)),
    observacao: "",
    grupoMuscular: labelGrupoMuscular(item.grupoMuscular) || item.grupoMuscular,
    imagemUrl: item.imagemUrl ?? item.gifUrl ?? undefined,
    modoSeries: "iguais",
    passoDecrescente: "2",
    exercicioContinuo: continuo,
  };
}

/** Mantém o array de reps alinhado à quantidade de séries no modo pirâmide. */
export function sincronizarRepsPorSerie(exercicio: ExercicioForm): ExercicioForm {
  if (exercicio.modoSeries !== "decrescente") {
    return { ...exercicio, repeticoesPorSerie: undefined };
  }

  const series = Number.parseInt(exercicio.series, 10);
  if (Number.isNaN(series) || series < 1) return exercicio;

  const base = Number.parseInt(exercicio.repeticoes, 10);
  const baseSafe = Number.isNaN(base) || base < 1 ? 12 : Math.min(100, base);
  const atual = exercicio.repeticoesPorSerie ?? [];

  const lista: number[] = [];
  for (let i = 0; i < series; i++) {
    const valor = atual[i];
    if (typeof valor === "number" && Number.isFinite(valor) && valor >= 1) {
      lista.push(Math.min(100, Math.floor(valor)));
    } else {
      lista.push(Math.max(1, baseSafe - i * 2));
    }
  }

  return { ...exercicio, repeticoesPorSerie: lista };
}

export function setRepsDaSerie(
  exercicio: ExercicioForm,
  setIdx: number,
  valor: number
): ExercicioForm {
  const sync = sincronizarRepsPorSerie({
    ...exercicio,
    modoSeries: "decrescente",
  });
  const lista = [...(sync.repeticoesPorSerie ?? [])];
  if (setIdx < 0 || setIdx >= lista.length) return sync;

  lista[setIdx] = Math.max(1, Math.min(100, Math.floor(valor)));
  return {
    ...sync,
    repeticoesPorSerie: lista,
    repeticoes: String(lista[0]),
  };
}

export function exercicioFormValido(exercicio: ExercicioForm): boolean {
  return Boolean(exercicio.nome.trim() || exercicio.exercicioCatalogoId);
}

export function exercicioFormParaPayload(exercicio: ExercicioForm) {
  const sync = sincronizarRepsPorSerie(exercicio);
  const rest = Number.parseInt(sync.restSeconds, 10);
  const series = Number.parseInt(sync.series, 10);
  const repeticoes = Number.parseInt(sync.repeticoes, 10);
  const continuo = sync.exercicioContinuo === true;
  const porSerie =
    sync.modoSeries === "decrescente" &&
    sync.repeticoesPorSerie &&
    sync.repeticoesPorSerie.length === series
      ? sync.repeticoesPorSerie
      : [];

  return {
    nome: sync.nome.trim(),
    series,
    repeticoes: porSerie.length > 0 ? porSerie[0] : repeticoes,
    repeticoesPorSerie: porSerie,
    restSeconds: continuo ? 0 : Number.isNaN(rest) ? 60 : rest,
    exercicioContinuo: continuo,
    observacao: sync.observacao.trim() || undefined,
    grupoMuscular:
      normalizarGrupoMuscular(sync.grupoMuscular) ||
      sync.grupoMuscular.trim() ||
      undefined,
    exercicioCatalogoId: sync.exercicioCatalogoId,
  };
}
