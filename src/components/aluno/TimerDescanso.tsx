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
    <section className={`timer-card${ativo ? " timer-card--active" : ""}`}>
      <p className="timer-display">{formatarTempo(segundos)}</p>

      <div className="timer-progress">
        <div className="timer-progress-fill" style={{ width: `${progresso}%` }} />
      </div>

      <div className="timer-controls">
        <button
          type="button"
          onClick={onIniciar}
          className="timer-control-btn timer-control-btn--primary"
          aria-label="Iniciar"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={onPausar}
          className="timer-control-btn timer-control-btn--secondary"
          aria-label="Pausar"
        >
          ⏸
        </button>
        <button
          type="button"
          onClick={onResetar}
          className="timer-control-btn timer-control-btn--secondary"
          aria-label="Resetar"
        >
          ↺
        </button>
      </div>

      <div style={{ marginTop: "14px" }}>
        <label className="field-label" htmlFor="timer-custom">
          Tempo padrão (s)
        </label>
        <input
          id="timer-custom"
          type="number"
          min={1}
          max={600}
          className="input-field"
          value={timerCustom}
          onChange={(e) => onChangeCustom(Number.parseInt(e.target.value, 10) || 60)}
        />
      </div>
    </section>
  );
}
