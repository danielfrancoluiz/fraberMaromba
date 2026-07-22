"use client";

import { ModulosContratar } from "@/components/pagamento/ModulosContratar";
import { HistoricoPagamentos } from "@/components/pagamento/HistoricoPagamentos";

interface PagamentoCardProps {
  alunoId: string;
  /** Compat: ignorado — módulos vêm do pagamento. */
  planoAtual?: string;
  modulosAtuais?: string[];
}

export function PagamentoCard({
  alunoId,
  modulosAtuais = [],
}: PagamentoCardProps) {
  return (
    <div className="pagamento-section">
      <ModulosContratar alunoId={alunoId} modulosAtuais={modulosAtuais} />
      <HistoricoPagamentos alunoId={alunoId} />
    </div>
  );
}
