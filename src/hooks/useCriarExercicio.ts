"use client";

import { useCallback, useState } from "react";
import { CriarExercicioForm, CriarExercicioFormErrors } from "@/types";
import { criarExercicioProfessor } from "@/services/exercicioCatalogoService";
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
};

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
      const url = new URL(form.gifUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.gifUrl = "URL inválida";
      }
    } catch {
      errors.gifUrl = "URL inválida";
    }
  }

  return errors;
}

export function useCriarExercicio() {
  const [form, setForm] = useState<CriarExercicioForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<CriarExercicioFormErrors>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  const handleChange = useCallback(
    (campo: keyof CriarExercicioForm, valor: string) => {
      setForm((prev) => {
        const next = { ...prev, [campo]: valor };
        if (campo === "grupoMuscular") {
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

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const novosErros = validarForm(form);
    if (Object.keys(novosErros).length > 0) {
      setErrors(novosErros);
      return false;
    }

    setLoadingSubmit(true);
    setFeedbackErro(null);
    setFeedbackSucesso(null);

    try {
      await criarExercicioProfessor({
        nome: form.nome.trim(),
        gifUrl: form.gifUrl.trim() || undefined,
        grupoMuscular: form.grupoMuscular,
        subGrupoMuscular: form.subGrupoMuscular,
        series: Number.parseInt(form.series, 10),
        repeticoes: Number.parseInt(form.repeticoes, 10),
        descanso: Number.parseInt(form.descanso, 10),
      });
      setFeedbackSucesso("Exercício criado com sucesso!");
      setForm(FORM_INICIAL);
      setErrors({});
      return true;
    } catch (error) {
      setFeedbackErro(error instanceof Error ? error.message : "Erro ao criar exercício");
      return false;
    } finally {
      setLoadingSubmit(false);
    }
  }, [form]);

  return {
    form,
    errors,
    loadingSubmit,
    feedbackSucesso,
    feedbackErro,
    handleChange,
    handleSubmit,
  };
}
