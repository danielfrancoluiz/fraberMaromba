"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FormularioCartaoProps {
  onCancelar?: () => void;
}

type ConfirmarBody = {
  confirmado?: boolean;
  modulosAtivos?: string[];
  modulosVencimentos?: Record<string, string>;
  planoVenceEm?: string;
  planoId?: string;
  status?: string;
  destino?: string;
};

export function FormularioCartao({ onCancelar }: FormularioCartaoProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErro(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/pagamento/sucesso`,
        },
      });

      if (error) {
        setErro(error.message ?? "Não foi possível concluir o pagamento.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        let body: ConfirmarBody = {};
        try {
          const res = await fetch("/api/pagamentos/confirmar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          });
          body = (await res.json().catch(() => ({}))) as ConfirmarBody;
        } catch {
          /* webhook ainda pode confirmar */
        }

        // Atualiza o JWT com os módulos liberados (sem timeout) — middleware precisa disso.
        if (body.modulosAtivos || body.modulosVencimentos) {
          await update({
            modulosAtivos: body.modulosAtivos,
            modulosVencimentos: body.modulosVencimentos,
            planoVenceEm: body.planoVenceEm,
            planoId: body.planoId,
            status: body.status ?? "ativo_plataforma",
          });
        } else {
          await update();
        }

        const role = session?.user?.role;
        if (role === "professor") {
          router.replace("/pagamento/sucesso?ok=1&role=professor");
        } else {
          const destino = body.destino?.startsWith("/aluno/")
            ? body.destino
            : "/aluno/dashboard";
          router.replace(destino);
        }
        router.refresh();
        return;
      }

      setErro("Pagamento ainda não confirmado. Tente novamente em instantes.");
    } catch {
      setErro("Erro ao processar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="pagamento-cartao-form" onSubmit={(e) => void handleSubmit(e)}>
      <PaymentElement
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card"],
          wallets: {
            applePay: "never",
            googlePay: "never",
          },
        }}
      />

      {erro ? <p className="field-error">{erro}</p> : null}

      <div className="action-row" style={{ marginTop: 16 }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={!stripe || !elements || loading}
        >
          {loading ? "Processando..." : "Pagar agora"}
        </button>
        {onCancelar ? (
          <button
            type="button"
            className="btn-ghost"
            disabled={loading}
            onClick={onCancelar}
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
