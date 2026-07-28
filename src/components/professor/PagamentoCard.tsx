"use client";

import { OfertasContratar } from "@/components/pagamento/OfertasContratar";
import { HistoricoPagamentos } from "@/components/pagamento/HistoricoPagamentos";

interface PagamentoCardProps {
  alunoId: string;
  planoAtual?: string;
  modulosAtuais?: string[];
  modulosVencimentos?: Partial<Record<string, string>> | null;
}

export function PagamentoCard({
  alunoId,
  modulosAtuais = [],
  modulosVencimentos = null,
}: PagamentoCardProps) {
  return (
    <div className="pagamento-section">
      <OfertasContratar
        alunoId={alunoId}
        grupo="treino"
        titulo="Treino do aluno"
        modulosAtuais={modulosAtuais}
        modulosVencimentos={modulosVencimentos}
      />
      <OfertasContratar
        alunoId={alunoId}
        grupo="nutricao"
        titulo="Nutrição do aluno"
        modulosAtuais={modulosAtuais}
        modulosVencimentos={modulosVencimentos}
      />
      <HistoricoPagamentos alunoId={alunoId} titulo="Contratações do aluno" />
    </div>
  );
}
