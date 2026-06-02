"use client";

import { useMemo, useState } from "react";
import { MedicaoFisica } from "@/hooks/useMedicoes";

interface GraficoEvolucaoProps {
  medicoes: MedicaoFisica[];
}

type MedidaKey = "peso" | "cintura" | "quadril" | "bracoDireito" | "coxaDireita";

interface MedidaOption {
  key: MedidaKey;
  label: string;
}

interface PontoGrafico {
  data: string;
  valor: number;
  label: string;
}

const MEDIDAS: MedidaOption[] = [
  { key: "peso", label: "Peso" },
  { key: "cintura", label: "Cintura" },
  { key: "quadril", label: "Quadril" },
  { key: "bracoDireito", label: "Braço Direito" },
  { key: "coxaDireita", label: "Coxa Direita" },
];

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

const SVG_WIDTH = 600;
const SVG_HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 48, left: 48 };

function formatarDataCurta(dataIso: string): string {
  const data = new Date(dataIso);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

function extrairPontos(medicoes: MedicaoFisica[], medida: MedidaKey): PontoGrafico[] {
  return medicoes
    .filter((m) => m[medida] !== null && m[medida] !== undefined)
    .map((m) => ({
      data: m.dataMedicao,
      valor: m[medida] as number,
      label: `${formatarDataCurta(m.dataMedicao)}: ${m[medida]}`,
    }))
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
}

export function GraficoEvolucao({ medicoes }: GraficoEvolucaoProps) {
  const [medidaSelecionada, setMedidaSelecionada] = useState<MedidaKey>("peso");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const pontos = useMemo(
    () => extrairPontos(medicoes, medidaSelecionada),
    [medicoes, medidaSelecionada]
  );

  const chartWidth = SVG_WIDTH - PADDING.left - PADDING.right;
  const chartHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  const { linhaPath, circulos, labelsX } = useMemo(() => {
    if (pontos.length < 2) {
      return { linhaPath: "", circulos: [], labelsX: [] };
    }

    const valores = pontos.map((p) => p.valor);
    const minVal = Math.min(...valores);
    const maxVal = Math.max(...valores);
    const range = maxVal - minVal || 1;

    const coords = pontos.map((ponto, index) => {
      const x =
        PADDING.left +
        (pontos.length === 1 ? chartWidth / 2 : (index / (pontos.length - 1)) * chartWidth);
      const y =
        PADDING.top + chartHeight - ((ponto.valor - minVal) / range) * chartHeight;
      return { x, y, ponto };
    });

    const path = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
      .join(" ");

    const labels = coords.map((c) => ({
      x: c.x,
      label: formatarDataCurta(c.ponto.data),
    }));

    return {
      linhaPath: path,
      circulos: coords,
      labelsX: labels,
    };
  }, [pontos, chartWidth, chartHeight]);

  return (
    <section className="grafico-evolucao">
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "1rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <label
          style={{
            display: "block",
            color: colors.textSecondary,
            fontSize: "0.9rem",
            marginBottom: "6px",
          }}
        >
          Medida
        </label>
        <select
          value={medidaSelecionada}
          onChange={(e) => {
            setMedidaSelecionada(e.target.value as MedidaKey);
            setHoverIndex(null);
          }}
          style={{
            width: "100%",
            minHeight: "48px",
            borderRadius: "10px",
            border: `1px solid ${colors.border}`,
            backgroundColor: "#0D1B2E",
            color: colors.textPrimary,
            padding: "10px 12px",
            marginBottom: "1rem",
          }}
        >
          {MEDIDAS.map((medida) => (
            <option key={medida.key} value={medida.key}>
              {medida.label}
            </option>
          ))}
        </select>

        {pontos.length < 2 ? (
          <p
            style={{
              margin: 0,
              color: colors.textSecondary,
              textAlign: "center",
              padding: "2rem 1rem",
            }}
          >
            Adicione pelo menos 2 medições para ver o gráfico.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              width="100%"
              style={{ display: "block", minWidth: "320px" }}
              role="img"
              aria-label="Gráfico de evolução"
            >
              <line
                x1={PADDING.left}
                y1={PADDING.top + chartHeight}
                x2={PADDING.left + chartWidth}
                y2={PADDING.top + chartHeight}
                stroke={colors.border}
                strokeWidth={1}
              />
              <line
                x1={PADDING.left}
                y1={PADDING.top}
                x2={PADDING.left}
                y2={PADDING.top + chartHeight}
                stroke={colors.border}
                strokeWidth={1}
              />

              {labelsX.map((item) => (
                <text
                  key={item.label + item.x}
                  x={item.x}
                  y={SVG_HEIGHT - 12}
                  fill={colors.textSecondary}
                  fontSize={11}
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              ))}

              <path
                d={linhaPath}
                fill="none"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinejoin="round"
              />

              {circulos.map((circulo, index) => (
                <g key={circulo.ponto.data}>
                  <circle
                    cx={circulo.x}
                    cy={circulo.y}
                    r={hoverIndex === index ? 7 : 5}
                    fill={colors.primary}
                    stroke={colors.textPrimary}
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                  {hoverIndex === index ? (
                    <>
                      <rect
                        x={circulo.x - 50}
                        y={circulo.y - 36}
                        width={100}
                        height={24}
                        rx={4}
                        fill="#0D1B2E"
                        stroke={colors.border}
                      />
                      <text
                        x={circulo.x}
                        y={circulo.y - 20}
                        fill={colors.textPrimary}
                        fontSize={11}
                        textAnchor="middle"
                      >
                        {circulo.ponto.label}
                      </text>
                    </>
                  ) : null}
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      <style jsx global>{`
        .grafico-evolucao {
          width: 100%;
          padding: 1rem;
        }
        @media (min-width: 768px) {
          .grafico-evolucao {
            max-width: 600px;
            margin: 0 auto;
          }
        }
        @media (min-width: 1024px) {
          .grafico-evolucao {
            max-width: 800px;
          }
        }
      `}</style>
    </section>
  );
}
