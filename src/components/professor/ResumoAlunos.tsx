"use client";

interface ResumoAlunosProps {
  total: number;
}

export function ResumoAlunos({ total }: ResumoAlunosProps) {
  return (
    <article className="stat-tile">
      <p className="stat-tile-value">{total}</p>
      <p className="stat-tile-label">Total de alunos</p>
    </article>
  );
}
