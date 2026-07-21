"use client";

import { Elements } from "@stripe/react-stripe-js";
import { FormularioCartao } from "@/components/pagamento/FormularioCartao";
import { getStripeBrowser } from "@/lib/stripe-browser";

interface PagamentoElementsProps {
  clientSecret: string;
  onCancelar: () => void;
}

export function PagamentoElements({
  clientSecret,
  onCancelar,
}: PagamentoElementsProps) {
  return (
    <div className="pagamento-cartao-wrap">
      <p className="pagamento-cartao-titulo">Dados do cartão</p>
      <Elements
        stripe={getStripeBrowser()}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#c45c26",
              borderRadius: "10px",
            },
          },
          locale: "pt-BR",
        }}
      >
        <FormularioCartao onCancelar={onCancelar} />
      </Elements>
    </div>
  );
}
