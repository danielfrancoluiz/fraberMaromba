import { describe, expect, it } from "vitest";
import {
  alunoPlanoAtivo,
  alunoTemModulo,
  destinoBloqueioModulo,
  hrefListagemModulo,
  moduloExigidoPelaRotaAluno,
  podeAcessarRotaAluno,
  resolverModulosAtivosAluno,
} from "@/lib/aluno-acesso";

const em30Dias = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
};

const ontem = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString();
};

describe("alunoTemModulo", () => {
  it("nega quando acesso é nulo", () => {
    expect(alunoTemModulo(null, "musculacao")).toBe(false);
    expect(alunoTemModulo(undefined, "corrida")).toBe(false);
  });

  it("com mapa de vencimentos, só libera módulo vigente", () => {
    const acesso = {
      modulosAtivos: ["musculacao", "corrida"],
      modulosVencimentos: {
        musculacao: ontem(),
        corrida: em30Dias(),
      },
    };
    expect(alunoTemModulo(acesso, "musculacao")).toBe(false);
    expect(alunoTemModulo(acesso, "corrida")).toBe(true);
    expect(alunoTemModulo(acesso, "nutricao")).toBe(false);
  });

  it("sem mapa, usa array + planoVenceEm legado", () => {
    expect(
      alunoTemModulo(
        { modulosAtivos: ["musculacao"], planoVenceEm: em30Dias() },
        "musculacao"
      )
    ).toBe(true);
    expect(
      alunoTemModulo(
        { modulosAtivos: ["musculacao"], planoVenceEm: ontem() },
        "musculacao"
      )
    ).toBe(false);
    expect(
      alunoTemModulo(
        { modulosAtivos: ["corrida"], planoVenceEm: em30Dias() },
        "musculacao"
      )
    ).toBe(false);
  });

  it("mapa vazio cai no fallback do array", () => {
    expect(
      alunoTemModulo(
        {
          modulosAtivos: ["nutricao"],
          modulosVencimentos: {},
          planoVenceEm: em30Dias(),
        },
        "nutricao"
      )
    ).toBe(true);
  });
});

describe("alunoPlanoAtivo / resolverModulosAtivosAluno", () => {
  it("plano ativo se houver algum módulo vigente no mapa", () => {
    expect(
      alunoPlanoAtivo({
        modulosVencimentos: { musculacao: em30Dias() },
      })
    ).toBe(true);
    expect(
      alunoPlanoAtivo({
        modulosVencimentos: { musculacao: ontem() },
      })
    ).toBe(false);
  });

  it("resolve só módulos vigentes", () => {
    expect(
      resolverModulosAtivosAluno({
        modulosVencimentos: {
          musculacao: em30Dias(),
          corrida: ontem(),
          nutricao: em30Dias(),
        },
      })
    ).toEqual(["musculacao", "nutricao"]);
  });
});

describe("moduloExigidoPelaRotaAluno / podeAcessarRotaAluno", () => {
  it("não confunde /aluno/treinos com /aluno/treino", () => {
    expect(moduloExigidoPelaRotaAluno("/aluno/treinos")).toBeNull();
    expect(moduloExigidoPelaRotaAluno("/aluno/treino")).toBe("musculacao");
    expect(moduloExigidoPelaRotaAluno("/aluno/treino/abc")).toBe("musculacao");
  });

  it("listagens de módulos ficam livres na rota", () => {
    expect(moduloExigidoPelaRotaAluno("/aluno/corrida")).toBeNull();
    expect(moduloExigidoPelaRotaAluno("/aluno/nutricao")).toBeNull();
    expect(moduloExigidoPelaRotaAluno("/aluno/dashboard")).toBeNull();
  });

  it("bloqueia execução de treino sem musculação", () => {
    const sem = { modulosAtivos: [] as string[] };
    const com = {
      modulosVencimentos: { musculacao: em30Dias() },
    };
    expect(podeAcessarRotaAluno("/aluno/treino/1", sem)).toBe(false);
    expect(podeAcessarRotaAluno("/aluno/treino/1", com)).toBe(true);
    expect(podeAcessarRotaAluno("/aluno/treinos", sem)).toBe(true);
  });
});

describe("hrefs de módulo", () => {
  it("retorna listagem e bloqueio corretos", () => {
    expect(hrefListagemModulo("musculacao")).toBe("/aluno/treinos");
    expect(hrefListagemModulo("corrida")).toBe("/aluno/corrida");
    expect(hrefListagemModulo("nutricao")).toBe("/aluno/nutricao");
    expect(destinoBloqueioModulo("musculacao")).toBe(
      "/aluno/modulo-bloqueado?m=musculacao"
    );
  });
});
