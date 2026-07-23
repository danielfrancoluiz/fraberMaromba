"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { atualizarSessaoComTimeout } from "@/lib/atualizar-sessao";

interface FormularioCartaoProps {
  onCancelar?: () => void;
}

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
        try {
          await fetch("/api/pagamentos/confirmar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          });
        } catch {
          /* webhook ainda pode confirmar */
        }

        // Não bloqueia a navegação se o sync da sessão travar.
        const sessaoAtualizada = (await atualizarSessaoComTimeout(() =>
          update()
        )) as { user?: { role?: string } } | null;
        const role = sessaoAtualizada?.user?.role ?? session?.user?.role;

        router.replace(
          role === "professor"
            ? "/pagamento/sucesso?ok=1&role=professor"
            : "/pagamento/sucesso?ok=1&role=aluno"
        );
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
