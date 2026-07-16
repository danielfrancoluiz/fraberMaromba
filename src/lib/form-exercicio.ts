import { Exercicio, ExercicioCatalogo, ExercicioForm, ModoSeriesForm } from "@/types";
import { labelGrupoMuscular, normalizarGrupoMuscular } from "@/lib/grupos-musculares";
import {
  gerarRepsDecrescentes,
  inferirPassoDecrescente,
  isPrescricaoDecrescente,
} from "@/lib/series-reps";

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
  };
}

function modoFromPrescricao(
  series: number,
  porSerie?: number[] | null
): { modoSeries: ModoSeriesForm; passoDecrescente: string; repeticoesPorSerie?: number[] } {
  if (isPrescricaoDecrescente(porSerie) && porSerie && porSerie.length === series) {
    return {
      modoSeries: "decrescente",
      passoDecrescente: String(inferirPassoDecrescente(porSerie)),
      repeticoesPorSerie: porSerie,
    };
  }
  return { modoSeries: "iguais", passoDecrescente: "2" };
}

export function exercicioFormFromExercicio(ex: Exercicio): ExercicioForm {
  const modo = modoFromPrescricao(ex.series, ex.repeticoesPorSerie);
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
    restSeconds: String(ex.restSeconds ?? 60),
    observacao: ex.observacao ?? "",
    grupoMuscular: ex.grupoMuscular ?? "",
    imagemUrl: ex.imagemUrl ?? ex.gifUrl,
    ...modo,
  };
}

export function exercicioFormFromCatalogo(item: ExercicioCatalogo): ExercicioForm {
  return {
    id: crypto.randomUUID(),
    exercicioCatalogoId: item.id,
    nome: item.nome,
    series: String(item.seriesPadrao ?? 3),
    repeticoes: String(item.repeticoesPadrao ?? 12),
    restSeconds: String(item.descansoPadrao ?? 60),
    observacao: "",
    grupoMuscular: labelGrupoMuscular(item.grupoMuscular) || item.grupoMuscular,
    imagemUrl: item.imagemUrl ?? item.gifUrl ?? undefined,
    modoSeries: "iguais",
    passoDecrescente: "2",
  };
}

export function sincronizarRepsPorSerie(exercicio: ExercicioForm): ExercicioForm {
  if (exercicio.modoSeries !== "decrescente") {
    return { ...exercicio, repeticoesPorSerie: undefined };
  }

  const series = Number.parseInt(exercicio.series, 10);
  const inicio = Number.parseInt(exercicio.repeticoes, 10);
  const passo = Number.parseInt(exercicio.passoDecrescente, 10);

  if (
    Number.isNaN(series) ||
    Number.isNaN(inicio) ||
    Number.isNaN(passo) ||
    series < 1 ||
    inicio < 1 ||
    passo < 1
  ) {
    return exercicio;
  }

  return {
    ...exercicio,
    repeticoesPorSerie: gerarRepsDecrescentes(inicio, series, passo),
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
  const porSerie =
    sync.modoSeries === "decrescente" && sync.repeticoesPorSerie?.length
      ? sync.repeticoesPorSerie
      : [];

  return {
    nome: sync.nome.trim(),
    series,
    repeticoes:
      porSerie.length > 0 ? porSerie[0] : repeticoes,
    repeticoesPorSerie: porSerie,
    restSeconds: Number.isNaN(rest) ? 60 : rest,
    observacao: sync.observacao.trim() || undefined,
    grupoMuscular:
      normalizarGrupoMuscular(sync.grupoMuscular) ||
      sync.grupoMuscular.trim() ||
      undefined,
    exercicioCatalogoId: sync.exercicioCatalogoId,
  };
}
