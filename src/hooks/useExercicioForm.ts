"use client";

import { useCallback, useEffect, useState } from "react";
import { CriarExercicioForm, CriarExercicioFormErrors, ExercicioCatalogo } from "@/types";
import {
  atualizarExercicioProfessor,
  buscarExercicioProfessor,
  criarExercicioProfessor,
} from "@/services/exercicioCatalogoService";
import { uploadMidiaExercicioProfessor } from "@/services/exercicioMidiaService";
import { normalizarGrupoMuscular } from "@/lib/grupos-musculares";
import { subGruposDoMembro } from "@/lib/sub-grupos-musculares";

const FORM_INICIAL: CriarExercicioForm = {
  nome: "",
  gifUrl: "",
  grupoMuscular: "",
  subGrupoMuscular: "",
  series: "3",
  repeticoes: "12",
  descanso: "60",
  unilateral: false,
};

function exercicioParaForm(item: ExercicioCatalogo): CriarExercicioForm {
  return {
    nome: item.nome,
    gifUrl: item.gifUrl ?? "",
    grupoMuscular: item.grupoMuscular,
    subGrupoMuscular: item.subGrupoMuscular ?? "",
    series: String(item.seriesPadrao ?? 3),
    repeticoes: String(item.repeticoesPadrao ?? 12),
    descanso: String(item.descansoPadrao ?? 60),
    unilateral: item.unilateral ?? false,
  };
}

function validarForm(form: CriarExercicioForm): CriarExercicioFormErrors {
  const errors: CriarExercicioFormErrors = {};

  if (!form.nome.trim()) errors.nome = "Informe o nome do exercício";

  if (!form.grupoMuscular) {
    errors.grupoMuscular = "Selecione o membro";
  } else {
    const subGrupos = subGruposDoMembro(normalizarGrupoMuscular(form.grupoMuscular));
    if (subGrupos.length > 0 && !form.subGrupoMuscular) {
      errors.subGrupoMuscular = "Selecione o sub-membro";
    }
  }

  const series = Number.parseInt(form.series, 10);
  if (!form.series.trim() || Number.isNaN(series) || series < 1) {
    errors.series = "Informe séries válidas";
  }

  const repeticoes = Number.parseInt(form.repeticoes, 10);
  if (!form.repeticoes.trim() || Number.isNaN(repeticoes) || repeticoes < 1) {
    errors.repeticoes = "Informe repetições válidas";
  }

  const descanso = Number.parseInt(form.descanso, 10);
  if (!form.descanso.trim() || Number.isNaN(descanso) || descanso < 0) {
    errors.descanso = "Informe o descanso em segundos";
  }

  if (form.gifUrl.trim()) {
    try {
      new URL(form.gifUrl.trim());
    } catch {
      errors.gifUrl = "URL da mídia inválida";
    }
  }

  return errors;
}

function formParaPayload(form: CriarExercicioForm) {
  return {
    nome: form.nome.trim(),
    gifUrl: form.gifUrl.trim() || undefined,
    grupoMuscular: form.grupoMuscular,
    subGrupoMuscular: form.subGrupoMuscular,
    series: Number.parseInt(form.series, 10),
    repeticoes: Number.parseInt(form.repeticoes, 10),
    descanso: Number.parseInt(form.descanso, 10),
    unilateral: form.unilateral,
  };
}

interface UseExercicioFormOptions {
  exercicioId?: string;
}

export function useExercicioForm({ exercicioId }: UseExercicioFormOptions = {}) {
  const modoEdicao = Boolean(exercicioId);
  const [form, setForm] = useState<CriarExercicioForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<CriarExercicioFormErrors>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDados, setLoadingDados] = useState(modoEdicao);
  const [erroCarregar, setErroCarregar] = useState<string | null>(null);
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);

  useEffect(() => {
    if (!exercicioId) return;

    let ativo = true;
    setLoadingDados(true);
    setErroCarregar(null);

    void buscarExercicioProfessor(exercicioId)
      .then((item) => {
        if (!ativo) return;
        setForm(exercicioParaForm(item));
      })
      .catch((error) => {
        if (!ativo) return;
        setErroCarregar(
          error instanceof Error ? error.message : "Erro ao carregar exercício"
        );
      })
      .finally(() => {
        if (ativo) setLoadingDados(false);
      });

    return () => {
      ativo = false;
    };
  }, [exercicioId]);

  const handleChange = useCallback(
    (campo: keyof CriarExercicioForm, valor: string | boolean) => {
      setForm((prev) => {
        const next = { ...prev, [campo]: valor };
        if (campo === "grupoMuscular" && typeof valor === "string") {
          next.subGrupoMuscular = "";
        }
        return next;
      });
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
      setFeedbackErro(null);
      setFeedbackSucesso(null);
    },
    []
  );

  const toggleUnilateral = useCallback(() => {
    setForm((prev) => ({ ...prev, unilateral: !prev.unilateral }));
    setFeedbackErro(null);
    setFeedbackSucesso(null);
  }, []);

  const removerMidia = useCallback(() => {
    setPreviewLocal((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPreviewMime(null);
    handleChange("gifUrl", "");
    setErrors((prev) => ({ ...prev, gifUrl: undefined }));
  }, [handleChange]);

  const enviarMidia = useCallback(
    async (file: File) => {
      setLoadingUpload(true);
      setFeedbackErro(null);
      setErrors((prev) => ({ ...prev, gifUrl: undefined }));

      const preview = URL.createObjectURL(file);
      setPreviewMime(file.type);
      setPreviewLocal((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return preview;
      });

      try {
        const url = await uploadMidiaExercicioProfessor(file);
        setPreviewLocal((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setPreviewMime(null);
        handleChange("gifUrl", url);
      } catch (error) {
        setPreviewLocal((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setPreviewMime(null);
        setFeedbackErro(
          error instanceof Error ? error.message : "Erro ao enviar arquivo"
        );
      } finally {
        setLoadingUpload(false);
      }
    },
    [handleChange]
  );

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const novosErros = validarForm(form);
    if (Object.keys(novosErros).length > 0) {
      setErrors(novosErros);
      return false;
    }

    setLoadingSubmit(true);
    setFeedbackErro(null);
    setFeedbackSucesso(null);

    const payload = formParaPayload(form);

    try {
      if (modoEdicao && exercicioId) {
        await atualizarExercicioProfessor(exercicioId, payload);
        setFeedbackSucesso("Exercício atualizado com sucesso!");
      } else {
        await criarExercicioProfessor(payload);
        setFeedbackSucesso("Exercício criado com sucesso!");
        setForm(FORM_INICIAL);
      }
      setErrors({});
      return true;
    } catch (error) {
      setFeedbackErro(
        error instanceof Error
          ? error.message
          : modoEdicao
            ? "Erro ao atualizar exercício"
            : "Erro ao criar exercício"
      );
      return false;
    } finally {
      setLoadingSubmit(false);
    }
  }, [form, modoEdicao, exercicioId]);

  return {
    form,
    errors,
    loadingSubmit,
    loadingDados,
    erroCarregar,
    feedbackSucesso,
    feedbackErro,
    modoEdicao,
    handleChange,
    toggleUnilateral,
    handleSubmit,
    loadingUpload,
    previewLocal,
    previewMime,
    enviarMidia,
    removerMidia,
  };
}

/** @deprecated Use useExercicioForm */
export const useCriarExercicio = () => useExercicioForm();
