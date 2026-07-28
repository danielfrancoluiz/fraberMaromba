import { describe, expect, it } from "vitest";
import { destinoAposModulos } from "@/lib/destino-pos-pagamento";

describe("destinoAposModulos", () => {
  it("vai ao início do módulo único pago", () => {
    expect(destinoAposModulos(["corrida"])).toBe("/aluno/corrida");
    expect(destinoAposModulos(["musculacao"])).toBe("/aluno/treinos");
    expect(destinoAposModulos(["nutricao"])).toBe("/aluno/nutricao");
  });

  it("combo musculação+corrida vai ao dashboard", () => {
    expect(destinoAposModulos(["musculacao", "corrida"])).toBe(
      "/aluno/dashboard"
    );
  });

  it("lista vazia cai no dashboard", () => {
    expect(destinoAposModulos([])).toBe("/aluno/dashboard");
  });
});
