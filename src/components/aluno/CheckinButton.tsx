"use client";

import { MapPin } from "lucide-react";
import { useCheckin } from "@/hooks/useCheckin";

interface CheckinButtonProps {
  treinoId?: string;
}

const colors = {
  background: "#132035",
  primary: "#2E7FD9",
  secondary: "#E8001C",
  textPrimary: "#F0F4FF",
  textSecondary: "#7A9CC4",
  border: "#1E3050",
  success: "#22c55e",
};

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
    <div className="checkin-button-wrap">
      <button
        type="button"
        disabled={desabilitado}
        onClick={() => void fazerCheckin()}
        style={{
          width: "100%",
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          borderRadius: "10px",
          border: jaFezCheckinHoje
            ? `1px solid ${colors.success}`
            : "none",
          backgroundColor: jaFezCheckinHoje ? colors.background : colors.primary,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "0.95rem",
          cursor: desabilitado ? "not-allowed" : "pointer",
          opacity: desabilitado && !jaFezCheckinHoje ? 0.75 : 1,
        }}
      >
        {!jaFezCheckinHoje && !realizandoCheckin ? (
          <MapPin size={18} />
        ) : null}
        {jaFezCheckinHoje
          ? "✓ Presença registrada hoje"
          : realizandoCheckin
            ? "Registrando..."
            : "Registrar Presença"}
      </button>

      {feedbackSucesso ? (
        <p
          style={{
            margin: "8px 0 0",
            color: colors.success,
            fontSize: "0.9rem",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
          }}
        >
          Presença registrada!
        </p>
      ) : null}

      {feedbackErro ? (
        <p
          style={{
            margin: "8px 0 0",
            color: colors.secondary,
            fontSize: "0.9rem",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
          }}
        >
          {feedbackErro}
        </p>
      ) : null}

      <style jsx global>{`
        .checkin-button-wrap {
          width: 100%;
          padding: 1rem;
        }
        @media (min-width: 768px) {
          .checkin-button-wrap {
            max-width: 600px;
            margin: 0 auto;
            padding: 1rem;
          }
        }
        @media (min-width: 1024px) {
          .checkin-button-wrap {
            max-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}
