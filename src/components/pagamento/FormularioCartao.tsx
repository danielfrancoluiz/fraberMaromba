"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { finalizarPosPagamentoAluno } from "@/lib/pos-pagamento-cliente";

interface FormularioCartaoProps {
  onCancelar?: () => void;
}

export function FormularioCartao({ onCancelar }: FormularioCartaoProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [formPronto, setFormPronto] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !formPronto) return;

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
        const role = session?.user?.role;
        if (role === "professor") {
          await update({ syncFromDb: true });
          window.location.assign("/pagamento/sucesso?ok=1&role=professor");
          return;
        }

        await finalizarPosPagamentoAluno({
          paymentIntentId: paymentIntent.id,
          update,
        });
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
      <p className="pagamento-cartao-titulo">Dados do cartão</p>

      <div className="pagamento-cartao-fields-wrap">
        {!formPronto ? (
          <div className="pagamento-cartao-loading" role="status">
            <Loader2
              size={22}
              className="pagamento-cartao-spinner text-accent"
              aria-hidden
            />
            <p className="text-muted" style={{ margin: 0 }}>
              Carregando formulário do cartão...
            </p>
          </div>
        ) : null}

        <div
          className={
            formPronto
              ? "pagamento-cartao-fields"
              : "pagamento-cartao-fields pagamento-cartao-fields--pending"
          }
          aria-hidden={!formPronto}
        >
          <PaymentElement
            onReady={() => setFormPronto(true)}
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card"],
              wallets: {
                applePay: "never",
                googlePay: "never",
              },
            }}
          />
        </div>
      </div>

      {formPronto ? (
        <>
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
        </>
      ) : null}
    </form>
  );
}
