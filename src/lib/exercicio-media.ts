import { Exercicio, ExercicioSubstituto } from "@/types";
import { getExercicioImagemUrl } from "@/lib/exercicio-imagem";

export function urlMidiaExercicio(
  exercicio: Pick<Exercicio, "nome" | "imagemUrl" | "gifUrl">
): string | null {
  return (
    getExercicioImagemUrl(exercicio.nome) ??
    exercicio.imagemUrl ??
    exercicio.gifUrl ??
    null
  );
}

export function urlMidiaSubstituto(sub: ExercicioSubstituto): string | null {
  return (
    getExercicioImagemUrl(sub.nome) ?? sub.imagemUrl ?? sub.gifUrl ?? null
  );
}
