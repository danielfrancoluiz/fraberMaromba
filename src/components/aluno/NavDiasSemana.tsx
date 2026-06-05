"use client";

import { useEffect, useRef } from "react";

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

export function NavDiasSemana({
  dias,
  diaSelecionado,
  onChange,
}: NavDiasSemanaProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const botao = nav.querySelector<HTMLElement>(`[data-dia="${diaSelecionado}"]`);
    botao?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [diaSelecionado]);

  return (
    <nav ref={navRef} className="nav-dias-semana" aria-label="Dias da semana">
      {dias.map((dia) => {
        const selecionado = dia === diaSelecionado;
        return (
          <button
            key={dia}
            type="button"
            data-dia={dia}
            onClick={() => onChange(dia)}
            className={`nav-dia-btn ${selecionado ? "nav-dia-btn--active" : "nav-dia-btn--inactive"}`}
          >
            {labelDia(dia)}
          </button>
        );
      })}
    </nav>
  );
}
