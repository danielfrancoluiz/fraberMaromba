"use client";

import { useEffect, useMemo, useState } from "react";
import { MedicaoFisica } from "@/hooks/useMedicoes";

interface GraficoEvolucaoProps {
  medicoes: MedicaoFisica[];
}

type MedidaKey =
  | "peso"
  | "cintura"
  | "quadril"
  | "bracoDireito"
  | "bracoEsquerdo"
  | "coxaDireita"
  | "coxaEsquerda";

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
  { key: "bracoDireito", label: "Braço D." },
  { key: "bracoEsquerdo", label: "Braço E." },
  { key: "coxaDireita", label: "Coxa D." },
  { key: "coxaEsquerda", label: "Coxa E." },
];

const SVG_WIDTH = 640;
const SVG_HEIGHT = 300;
const PADDING = { top: 44, right: 28, bottom: 52, left: 56 };

function formatarDataCurta(dataIso: string): string {
  const data = new Date(dataIso);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

function formatarValor(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

function valorNumerico(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number" && !Number.isNaN(valor)) return valor;
  if (typeof valor === "string") {
    const numero = Number.parseFloat(valor.replace(",", "."));
    return Number.isNaN(numero) ? null : numero;
  }
  return null;
}

function extrairPontos(medicoes: MedicaoFisica[], medida: MedidaKey): PontoGrafico[] {
  return medicoes
    .map((m) => {
      const valor = valorNumerico(m[medida]);
      if (valor === null) return null;
      return {
        data: m.dataMedicao,
        valor,
        label: `${formatarDataCurta(m.dataMedicao)} · ${formatarValor(valor)}`,
      };
    })
    .filter((p): p is PontoGrafico => p !== null)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
}

function contarPontosPorMedida(medicoes: MedicaoFisica[]): Record<MedidaKey, number> {
  return MEDIDAS.reduce(
    (acc, medida) => {
      acc[medida.key] = extrairPontos(medicoes, medida.key).length;
      return acc;
    },
    {} as Record<MedidaKey, number>
  );
}

function calcularTicks(min: number, max: number, total = 4): number[] {
  if (min === max) return [min];
  const passo = (max - min) / (total - 1);
  return Array.from({ length: total }, (_, i) => min + passo * i);
}

export function GraficoEvolucao({ medicoes }: GraficoEvolucaoProps) {
  const [medidaSelecionada, setMedidaSelecionada] = useState<MedidaKey>("peso");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const contagemPorMedida = useMemo(
    () => contarPontosPorMedida(medicoes),
    [medicoes]
  );

  useEffect(() => {
    if (contagemPorMedida[medidaSelecionada] > 0) return;
    const primeiraComDados = MEDIDAS.find((m) => contagemPorMedida[m.key] > 0);
    if (primeiraComDados) setMedidaSelecionada(primeiraComDados.key);
  }, [contagemPorMedida, medidaSelecionada]);

  const pontos = useMemo(
    () => extrairPontos(medicoes, medidaSelecionada),
    [medicoes, medidaSelecionada]
  );

  const medidaLabel =
    MEDIDAS.find((m) => m.key === medidaSelecionada)?.label ?? medidaSelecionada;

  const chartWidth = SVG_WIDTH - PADDING.left - PADDING.right;
  const chartHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  const chartData = useMemo(() => {
    if (pontos.length < 2) {
      return { linhaPath: "", circulos: [], labelsX: [], ticksY: [] as number[] };
    }

    const valores = pontos.map((p) => p.valor);
    const minVal = Math.min(...valores);
    const maxVal = Math.max(...valores);
    const range = maxVal - minVal || 1;
    const paddingVal = range * 0.12;
    const minPlot = minVal - paddingVal;
    const maxPlot = maxVal + paddingVal;
    const plotRange = maxPlot - minPlot;

    const ticksY = calcularTicks(minVal, maxVal);

    const coords = pontos.map((ponto, index) => {
      const x = PADDING.left + (index / (pontos.length - 1)) * chartWidth;
      const y =
        PADDING.top + chartHeight - ((ponto.valor - minPlot) / plotRange) * chartHeight;
      return { x, y, ponto };
    });

    const path = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(" ");

    return {
      linhaPath: path,
      circulos: coords,
      labelsX: coords.map((c, index) => ({
        x: c.x,
        label: formatarDataCurta(c.ponto.data),
        key: `${c.ponto.data}-${index}`,
      })),
      ticksY,
      minPlot,
      maxPlot,
      plotRange,
    };
  }, [pontos, chartWidth, chartHeight]);

  return (
    <section style={{ width: "100%" }}>
      <div className="card" style={{ padding: "1.125rem" }}>
        <p className="text-muted" style={{ margin: "0 0 10px", fontSize: "0.875rem" }}>
          Evolução — escolha a medida
        </p>

        <div className="chip-group" role="group" aria-label="Selecionar medida">
          {MEDIDAS.map((medida) => {
            const total = contagemPorMedida[medida.key];
            const ativa = medidaSelecionada === medida.key;
            return (
              <button
                key={medida.key}
                type="button"
                aria-pressed={ativa}
                disabled={total === 0}
                className={`chip ${ativa ? "chip-active" : ""} ${total === 0 ? "chip-disabled" : ""}`}
                onClick={() => {
                  setMedidaSelecionada(medida.key);
                  setHoverIndex(null);
                }}
              >
                {medida.label}
                {total > 0 ? ` · ${total}` : ""}
              </button>
            );
          })}
        </div>

        {medicoes.length === 0 ? (
          <p className="chart-empty" style={{ marginTop: "1rem" }}>
            Nenhuma medição registrada ainda. Salve a primeira medição acima.
          </p>
        ) : pontos.length === 0 ? (
          <p className="chart-empty" style={{ marginTop: "1rem" }}>
            Nenhum valor de &quot;{medidaLabel}&quot; nas medições. Escolha outra medida ou
            preencha este campo na próxima medição.
          </p>
        ) : pontos.length === 1 ? (
          <p className="chart-empty" style={{ marginTop: "1rem" }}>
            <strong style={{ color: "var(--fraber-text)" }}>
              {formatarValor(pontos[0].valor)}
            </strong>{" "}
            em {formatarDataCurta(pontos[0].data)} — registre mais uma medição com &quot;
            {medidaLabel}&quot; para ver o gráfico de evolução.
          </p>
        ) : (
          <div style={{ marginTop: "1rem", overflow: "visible" }}>
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              width="100%"
              style={{ display: "block", minWidth: "300px", overflow: "visible" }}
              role="img"
              aria-label={`Gráfico de evolução: ${medidaLabel}`}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = PADDING.top + chartHeight * (1 - ratio);
                return (
                  <line
                    key={ratio}
                    x1={PADDING.left}
                    y1={y}
                    x2={PADDING.left + chartWidth}
                    y2={y}
                    stroke="var(--fraber-border)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.6}
                  />
                );
              })}

              {chartData.ticksY.map((tick) => {
                const y =
                  PADDING.top +
                  chartHeight -
                  ((tick - chartData.minPlot!) / chartData.plotRange!) * chartHeight;
                return (
                  <text
                    key={tick}
                    x={PADDING.left - 10}
                    y={y + 4}
                    fill="var(--fraber-text-muted)"
                    fontSize={11}
                    textAnchor="end"
                  >
                    {formatarValor(tick)}
                  </text>
                );
              })}

              <line
                x1={PADDING.left}
                y1={PADDING.top + chartHeight}
                x2={PADDING.left + chartWidth}
                y2={PADDING.top + chartHeight}
                stroke="var(--fraber-border)"
                strokeWidth={1.5}
              />
              <line
                x1={PADDING.left}
                y1={PADDING.top}
                x2={PADDING.left}
                y2={PADDING.top + chartHeight}
                stroke="var(--fraber-border)"
                strokeWidth={1.5}
              />

              {chartData.labelsX.map((item) => (
                <text
                  key={item.key}
                  x={item.x}
                  y={SVG_HEIGHT - 16}
                  fill="var(--fraber-text-muted)"
                  fontSize={11}
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              ))}

              {chartData.linhaPath ? (
                <path
                  d={chartData.linhaPath}
                  fill="none"
                  stroke="var(--fraber-primary)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {chartData.circulos.map((circulo, index) => {
                const ativo = hoverIndex === index;
                const tooltipY = circulo.y < PADDING.top + 36 ? circulo.y + 28 : circulo.y - 28;
                const tooltipW = 108;
                const tooltipX = Math.min(
                  Math.max(circulo.x - tooltipW / 2, 8),
                  SVG_WIDTH - tooltipW - 8
                );

                return (
                  <g key={`${circulo.ponto.data}-${index}`}>
                    <circle
                      cx={circulo.x}
                      cy={circulo.y}
                      r={ativo ? 6 : 4.5}
                      fill="var(--fraber-primary)"
                      stroke="var(--fraber-text)"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(null)}
                    />
                    <text
                      x={circulo.x}
                      y={circulo.y - 12}
                      fill="var(--fraber-text-muted)"
                      fontSize={10}
                      textAnchor="middle"
                    >
                      {formatarValor(circulo.ponto.valor)}
                    </text>
                    {ativo ? (
                      <>
                        <rect
                          x={tooltipX}
                          y={tooltipY - 14}
                          width={tooltipW}
                          height={26}
                          rx={6}
                          fill="var(--fraber-bg-soft)"
                          stroke="var(--fraber-border)"
                        />
                        <text
                          x={tooltipX + tooltipW / 2}
                          y={tooltipY + 2}
                          fill="var(--fraber-text)"
                          fontSize={11}
                          textAnchor="middle"
                        >
                          {circulo.ponto.label}
                        </text>
                      </>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
