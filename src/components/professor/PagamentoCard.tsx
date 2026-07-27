"use client";

import { OfertasContratar } from "@/components/pagamento/OfertasContratar";
import { HistoricoPagamentos } from "@/components/pagamento/HistoricoPagamentos";

interface PagamentoCardProps {
  alunoId: string;
  planoAtual?: string;
  modulosAtuais?: string[];
}

export function PagamentoCard({
  alunoId,
  modulosAtuais = [],
}: PagamentoCardProps) {
  return (
    <div className="pagamento-section">
      <OfertasContratar
        alunoId={alunoId}
        grupo="treino"
        titulo="Treino do aluno"
        modulosAtuais={modulosAtuais}
      />
      <OfertasContratar
        alunoId={alunoId}
        grupo="nutricao"
        titulo="Nutrição do aluno"
        modulosAtuais={modulosAtuais}
      />
      <HistoricoPagamentos alunoId={alunoId} titulo="Contratações do aluno" />
    </div>
  );
}
