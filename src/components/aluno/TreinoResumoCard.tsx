"use client";

import { Play } from "lucide-react";
import { Treino } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ListCard } from "@/components/ui/ListCard";

interface TreinoResumoCardProps {
  treino: Treino;
  seriesConcluidas: number;
  onClick: () => void;
}

const DIA_LABELS: Record<Treino["diaSemana"], string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function TreinoResumoCard({
  treino,
  seriesConcluidas,
  onClick,
}: TreinoResumoCardProps) {
  const totalSeries = treino.exercicios.reduce((acc, ex) => acc + ex.series, 0);
  const progresso =
    totalSeries > 0 ? Math.min(100, (seriesConcluidas / totalSeries) * 100) : 0;
  const emAndamento = seriesConcluidas > 0 && seriesConcluidas < totalSeries;

  return (
    <ListCard
      title={treino.nome}
      icon={Play}
      onClick={onClick}
      accent="accent"
      badge={<Badge variant="muted">{DIA_LABELS[treino.diaSemana]}</Badge>}
      meta={
        <>
          <span>{treino.exercicios.length} exercícios</span>
          <span>·</span>
          <span>
            {seriesConcluidas}/{totalSeries} séries
            {emAndamento ? " · em andamento" : ""}
          </span>
        </>
      }
    >
      <div className="list-card-progress" role="progressbar" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100}>
        <div className="list-card-progress-fill" style={{ width: `${progresso}%` }} />
      </div>
    </ListCard>
  );
}
