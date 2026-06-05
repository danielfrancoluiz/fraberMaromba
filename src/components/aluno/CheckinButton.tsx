"use client";

import { MapPin } from "lucide-react";
import { useCheckin } from "@/hooks/useCheckin";

interface CheckinButtonProps {
  treinoId?: string;
}

export function CheckinButton({ treinoId }: CheckinButtonProps) {
  const {
    realizandoCheckin,
    jaFezCheckinHoje,
    feedbackSucesso,
    feedbackErro,
    fazerCheckin,
  } = useCheckin(treinoId);

  const desabilitado = jaFezCheckinHoje || realizandoCheckin;

  return (
    <div>
      <button
        type="button"
        disabled={desabilitado}
        onClick={() => void fazerCheckin()}
        className={`checkin-btn ${jaFezCheckinHoje ? "checkin-btn--done" : "checkin-btn--default"}`}
      >
        {!jaFezCheckinHoje && !realizandoCheckin ? <MapPin size={18} /> : null}
        {jaFezCheckinHoje
          ? "✓ Presença registrada hoje"
          : realizandoCheckin
            ? "Registrando..."
            : "Registrar presença"}
      </button>

      {feedbackSucesso ? (
        <p className="checkin-feedback checkin-feedback--success">Presença registrada!</p>
      ) : null}

      {feedbackErro ? (
        <p className="checkin-feedback checkin-feedback--error">{feedbackErro}</p>
      ) : null}
    </div>
  );
}
