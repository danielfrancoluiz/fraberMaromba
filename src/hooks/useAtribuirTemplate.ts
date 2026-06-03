import { useEffect, useState } from "react";
import { Treino, TreinoTemplate } from "@/types";
import {
  atribuirTemplatePAraAluno,
  listarTemplates,
} from "@/services/professorService";

interface UseAtribuirTemplateReturn {
  templates: TreinoTemplate[];
  loadingTemplates: boolean;
  templateSelecionado: TreinoTemplate | null;
  setTemplateSelecionado: (t: TreinoTemplate | null) => void;
  diaSemana: Treino["diaSemana"] | "";
  setDiaSemana: (d: Treino["diaSemana"] | "") => void;
  loadingSubmit: boolean;
  feedbackErro: string | null;
  handleAtribuir: () => Promise<void>;
}

export function useAtribuirTemplate(
  alunoId: string,
  professorId: string,
  onSucesso: () => void
): UseAtribuirTemplateReturn {
  const [templates, setTemplates] = useState<TreinoTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templateSelecionado, setTemplateSelecionado] =
    useState<TreinoTemplate | null>(null);
  const [diaSemana, setDiaSemana] = useState<Treino["diaSemana"] | "">("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  useEffect(() => {
    if (!professorId) {
      setLoadingTemplates(false);
      return;
    }

    let ativo = true;

    const carregarTemplates = async (): Promise<void> => {
      setLoadingTemplates(true);
      setFeedbackErro(null);

      try {
        const lista = await listarTemplates(professorId);
        if (ativo) setTemplates(lista);
      } catch (error) {
        if (!ativo) return;
        const mensagem =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar templates";
        setFeedbackErro(mensagem);
      } finally {
        if (ativo) setLoadingTemplates(false);
      }
    };

    void carregarTemplates();

    return () => {
      ativo = false;
    };
  }, [professorId]);

  const handleAtribuir = async (): Promise<void> => {
    if (!templateSelecionado) {
      setFeedbackErro("Selecione um template");
      return;
    }

    if (!diaSemana) {
      setFeedbackErro("Selecione o dia da semana");
      return;
    }

    setFeedbackErro(null);
    setLoadingSubmit(true);

    try {
      await atribuirTemplatePAraAluno(
        templateSelecionado.id,
        alunoId,
        professorId,
        diaSemana
      );
      onSucesso();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Não foi possível atribuir template";
      setFeedbackErro(mensagem);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return {
    templates,
    loadingTemplates,
    templateSelecionado,
    setTemplateSelecionado,
    diaSemana,
    setDiaSemana,
    loadingSubmit,
    feedbackErro,
    handleAtribuir,
  };
}
