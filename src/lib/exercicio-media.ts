import { Exercicio, ExercicioSubstituto } from "@/types";
import { getExercicioImagemUrl } from "@/lib/exercicio-imagem";
import { resolverUrlMidia } from "@/lib/exercicio-media-url";

function primeiraMidiaValida(
  ...urls: Array<string | null | undefined>
): string | null {
  for (const url of urls) {
    if (resolverUrlMidia(url)) return url!.trim();
  }
  return null;
}

export function urlMidiaExercicio(
  exercicio: Pick<Exercicio, "nome" | "imagemUrl" | "gifUrl">
): string | null {
  const catalogo = primeiraMidiaValida(exercicio.imagemUrl, exercicio.gifUrl);
  if (catalogo) {
    const resolvida = resolverUrlMidia(catalogo);
    return resolvida?.src ?? catalogo;
  }
  return getExercicioImagemUrl(exercicio.nome);
}

export function urlMidiaSubstituto(sub: ExercicioSubstituto): string | null {
  const catalogo = primeiraMidiaValida(sub.imagemUrl, sub.gifUrl);
  if (catalogo) {
    const resolvida = resolverUrlMidia(catalogo);
    return resolvida?.src ?? catalogo;
  }
  return getExercicioImagemUrl(sub.nome);
}
