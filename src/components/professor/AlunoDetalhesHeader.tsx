"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Aluno } from "@/types";
import { PageTopBar } from "@/components/ui/PageTopBar";

interface AlunoDetalhesHeaderProps {
  aluno: Aluno;
  onVoltar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}

export function AlunoDetalhesHeader({
  aluno,
  onVoltar,
  onEditar,
  onExcluir,
}: AlunoDetalhesHeaderProps) {
  return (
    <PageTopBar
      title={aluno.nomeCompleto}
      subtitle="Detalhes do aluno"
      onBack={onVoltar}
      action={
        <div className="page-topbar-actions">
          <button
            type="button"
            className="page-topbar-back page-topbar-back--danger"
            onClick={onExcluir}
            aria-label="Excluir aluno"
          >
            <Trash2 size={18} />
          </button>
          <button
            type="button"
            className="page-topbar-back page-topbar-back--primary"
            onClick={onEditar}
            aria-label="Editar aluno"
          >
            <Pencil size={18} />
          </button>
        </div>
      }
    />
  );
}
