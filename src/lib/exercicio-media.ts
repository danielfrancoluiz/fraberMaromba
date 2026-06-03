import { Exercicio, ExercicioSubstituto } from "@/types";
import { getExercicioImagemUrl } from "@/lib/exercicio-imagem";

export function urlMidiaExercicio(
  exercicio: Pick<Exercicio, "nome" | "imagemUrl" | "gifUrl">
): string | null {
  return (
    exercicio.imagemUrl ??
    exercicio.gifUrl ??
    getExercicioImagemUrl(exercicio.nome)
  );
}

export function urlMidiaSubstituto(sub: ExercicioSubstituto): string | null {
  return sub.imagemUrl ?? sub.gifUrl ?? getExercicioImagemUrl(sub.nome);
}
