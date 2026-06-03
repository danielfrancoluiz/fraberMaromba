import { Exercicio, ExercicioCatalogo, ExercicioForm } from "@/types";
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
  };
}

export function exercicioFormFromExercicio(ex: Exercicio): ExercicioForm {
  return {
    id: ex.id,
    exercicioCatalogoId: ex.exercicioCatalogoId,
    nome: ex.nome,
    series: String(ex.series),
    repeticoes: String(ex.repeticoes),
    restSeconds: String(ex.restSeconds ?? 60),
    observacao: ex.observacao ?? "",
    grupoMuscular: ex.grupoMuscular ?? "",
    imagemUrl: ex.imagemUrl ?? ex.gifUrl,
  };
}

export function exercicioFormFromCatalogo(item: ExercicioCatalogo): ExercicioForm {
  return {
    id: crypto.randomUUID(),
    exercicioCatalogoId: item.id,
    nome: item.nome,
    series: "3",
    repeticoes: "12",
    restSeconds: "60",
    observacao: "",
    grupoMuscular: labelGrupoMuscular(item.grupoMuscular) || item.grupoMuscular,
    imagemUrl: item.imagemUrl ?? item.gifUrl ?? undefined,
  };
}

export function exercicioFormValido(exercicio: ExercicioForm): boolean {
  return Boolean(exercicio.nome.trim() || exercicio.exercicioCatalogoId);
}

export function exercicioFormParaPayload(exercicio: ExercicioForm) {
  const rest = Number.parseInt(exercicio.restSeconds, 10);
  return {
    nome: exercicio.nome.trim(),
    series: Number.parseInt(exercicio.series, 10),
    repeticoes: Number.parseInt(exercicio.repeticoes, 10),
    restSeconds: Number.isNaN(rest) ? 60 : rest,
    observacao: exercicio.observacao.trim() || undefined,
    grupoMuscular:
      normalizarGrupoMuscular(exercicio.grupoMuscular) ||
      exercicio.grupoMuscular.trim() ||
      undefined,
    exercicioCatalogoId: exercicio.exercicioCatalogoId,
  };
}
