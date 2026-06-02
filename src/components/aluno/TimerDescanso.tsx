"use client";

interface TimerDescansoProps {
  segundos: number;
  ativo: boolean;
  timerCustom: number;
  onIniciar: () => void;
  onPausar: () => void;
  onResetar: () => void;
  onChangeCustom: (v: number) => void;
}

const colors = {
  surface: "#132035",
  primary: "#2E7FD9",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
};

function formatarTempo(totalSegundos: number): string {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

export function TimerDescanso({
  segundos,
  ativo,
  timerCustom,
  onIniciar,
  onPausar,
  onResetar,
  onChangeCustom,
}: TimerDescansoProps) {
  const progresso =
    timerCustom > 0 ? Math.min(100, Math.max(0, (segundos / timerCustom) * 100)) : 0;

  return (
    <section
      className={ativo ? "timer-card timer-card-ativo" : "timer-card"}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${ativo ? colors.primary : colors.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: "center",
          color: colors.textPrimary,
          fontSize: "2rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        {formatarTempo(segundos)}
      </p>

      <div
        style={{
          marginTop: "12px",
          height: "8px",
          borderRadius: "999px",
          backgroundColor: colors.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            backgroundColor: colors.primary,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "14px",
          display: "flex",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={onIniciar}
          style={{
            minHeight: "40px",
            minWidth: "40px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            fontSize: "1rem",
            cursor: "pointer",
          }}
          aria-label="Iniciar"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={onPausar}
          style={{
            minHeight: "40px",
            minWidth: "40px",
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            backgroundColor: "transparent",
            color: colors.textPrimary,
            fontSize: "1rem",
            cursor: "pointer",
          }}
          aria-label="Pausar"
        >
          ⏸
        </button>
        <button
          type="button"
          onClick={onResetar}
          style={{
            minHeight: "40px",
            minWidth: "40px",
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            backgroundColor: "transparent",
            color: colors.textPrimary,
            fontSize: "1rem",
            cursor: "pointer",
          }}
          aria-label="Resetar"
        >
          ↺
        </button>
      </div>

      <div style={{ marginTop: "14px" }}>
        <label
          style={{
            display: "block",
            color: colors.textSecondary,
            fontSize: "0.85rem",
            marginBottom: "6px",
          }}
        >
          Tempo padrão (s)
        </label>
        <input
          type="number"
          min={1}
          max={600}
          value={timerCustom}
          onChange={(e) => onChangeCustom(Number.parseInt(e.target.value, 10) || 60)}
          style={{
            minHeight: "48px",
            width: "100%",
            borderRadius: "10px",
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            padding: "10px 12px",
            fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes timer-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(46, 127, 217, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(46, 127, 217, 0.15);
          }
        }
        .timer-card-ativo {
          animation: timer-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
