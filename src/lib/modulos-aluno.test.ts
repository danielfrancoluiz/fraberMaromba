import { describe, expect, it } from "vitest";
import {
  moduloVigente,
  modulosVigentes,
  normalizarModulos,
} from "@/lib/modulos-aluno";

describe("modulos-aluno", () => {
  it("normaliza e deduplica ids válidos", () => {
    expect(normalizarModulos(["Musculacao", "corrida", "x", "corrida"])).toEqual(
      ["musculacao", "corrida"]
    );
  });

  it("moduloVigente respeita o dia atual", () => {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 5);
    const passado = new Date();
    passado.setDate(passado.getDate() - 2);
    expect(moduloVigente(futuro.toISOString())).toBe(true);
    expect(moduloVigente(passado.toISOString())).toBe(false);
    expect(moduloVigente(undefined)).toBe(false);
  });

  it("modulosVigentes filtra pelo mapa", () => {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 5);
    const passado = new Date();
    passado.setDate(passado.getDate() - 2);
    expect(
      modulosVigentes({
        musculacao: futuro.toISOString(),
        corrida: passado.toISOString(),
      })
    ).toEqual(["musculacao"]);
  });
});
