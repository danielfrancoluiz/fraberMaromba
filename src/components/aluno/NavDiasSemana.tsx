"use client";

import { useEffect, useRef } from "react";

const colors = {
  primary: "#2E7FD9",
  surface: "#132035",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
};

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
            style={{
              flexShrink: 0,
              border: "none",
              borderRadius: "999px",
              padding: "10px 16px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              backgroundColor: selecionado ? colors.primary : colors.surface,
              color: selecionado ? colors.textPrimary : colors.textSecondary,
            }}
          >
            {labelDia(dia)}
          </button>
        );
      })}

      <style jsx global>{`
        .nav-dias-semana {
          display: flex;
          flex-wrap: nowrap;
          gap: 8px;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .nav-dias-semana::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}
