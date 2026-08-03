"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";

const DIA_LABELS: Record<string, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

interface NavDiasSemanaProps {
  dias: string[];
  diaSelecionado: string;
  onChange: (d: string) => void;
}

function labelDia(dia: string): string {
  return DIA_LABELS[dia] ?? dia;
}

/** Cores via style inline — no mobile :hover/:focus de CSS não “prende” o vermelho. */
const ESTILO_ATIVO: CSSProperties = {
  background: "var(--fraber-primary)",
  color: "var(--fraber-text)",
  borderColor: "transparent",
};

const ESTILO_INATIVO: CSSProperties = {
  background: "var(--fraber-surface)",
  color: "var(--fraber-text-muted)",
  borderColor: "transparent",
};

export function NavDiasSemana({
  dias,
  diaSelecionado,
  onChange,
}: NavDiasSemanaProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const botao = nav.querySelector<HTMLElement>(
      `[data-dia="${CSS.escape(diaSelecionado)}"]`
    );
    botao?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [diaSelecionado]);

  const indiceAtual = Math.max(0, dias.indexOf(diaSelecionado));
  const temProximo = dias.length > 1;

  function irParaProximoDia() {
    if (dias.length === 0) return;
    const proximo = dias[(indiceAtual + 1) % dias.length];
    onChange(proximo);
  }

  return (
    <div className="nav-dias-semana-wrap">
      <nav
        ref={navRef}
        className="nav-dias-semana"
        aria-label="Dias da semana"
        role="tablist"
      >
        {dias.map((dia) => {
          const selecionado = dia === diaSelecionado;
          return (
            <button
              key={dia}
              type="button"
              role="tab"
              data-dia={dia}
              aria-selected={selecionado}
              tabIndex={selecionado ? 0 : -1}
              className="nav-dia-btn"
              style={selecionado ? ESTILO_ATIVO : ESTILO_INATIVO}
              onPointerUp={(e) => {
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              onClick={() => onChange(dia)}
            >
              {labelDia(dia)}
            </button>
          );
        })}
      </nav>

      {temProximo ? (
        <button
          type="button"
          className="nav-dias-semana-next"
          onClick={irParaProximoDia}
          aria-label="Próximo dia"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}
