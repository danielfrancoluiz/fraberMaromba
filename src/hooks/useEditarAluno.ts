import { useEffect, useState } from "react";
import { Aluno, AlunoEditErrors, AlunoEditForm, Plano } from "@/types";
import { atualizarAluno, buscarPlanos } from "@/services/professorService";
import {
  mascararTelefone,
  validarAltura,
  validarEmail,
  validarNomeCompleto,
  validarPeso,
  validarTelefone,
} from "@/utils/validators";

interface UseEditarAlunoReturn {
  form: AlunoEditForm;
  errors: AlunoEditErrors;
  planos: Plano[];
  loadingPlanos: boolean;
  loadingSubmit: boolean;
  feedbackSucesso: boolean;
  feedbackErro: string | null;
  handleChange: (campo: keyof AlunoEditForm, valor: string) => void;
  handleSubmit: () => Promise<void>;
}

const FORM_INICIAL: AlunoEditForm = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  peso: "",
  altura: "",
  objetivo: "",
  planoId: "",
};

function mapAlunoToForm(aluno: Aluno | null): AlunoEditForm {
  if (!aluno) return FORM_INICIAL;
  return {
    nomeCompleto: aluno.nomeCompleto,
    email: aluno.email,
    telefone: aluno.telefone,
    peso: String(aluno.peso),
    altura: String(aluno.altura),
    objetivo: aluno.objetivo,
    planoId: aluno.planoId,
  };
}

function validarFormularioEdicao(form: AlunoEditForm): AlunoEditErrors {
  const erros: AlunoEditErrors = {};

  if (!form.nomeCompleto.trim()) {
    erros.nomeCompleto = "Campo obrigatório";
  } else if (!validarNomeCompleto(form.nomeCompleto)) {
    erros.nomeCompleto = "Informe nome e sobrenome";
  }

  if (!form.email.trim()) {
    erros.email = "Campo obrigatório";
  } else if (!validarEmail(form.email)) {
    erros.email = "Email inválido";
  }

  if (!form.telefone.trim()) {
    erros.telefone = "Campo obrigatório";
  } else if (!validarTelefone(form.telefone)) {
    erros.telefone = "Telefone inválido. Use (00) 00000-0000";
  }

  if (!form.peso.trim()) {
    erros.peso = "Campo obrigatório";
  } else if (!validarPeso(form.peso)) {
    erros.peso = "Peso deve ser entre 20kg e 300kg";
  }

  if (!form.altura.trim()) {
    erros.altura = "Campo obrigatório";
  } else if (!validarAltura(form.altura)) {
    erros.altura = "Altura deve ser entre 100cm e 250cm";
  }

  if (!form.objetivo.trim()) {
    erros.objetivo = "Campo obrigatório";
  }

  if (!form.planoId.trim()) {
    erros.planoId = "Campo obrigatório";
  }

  return erros;
}

export function useEditarAluno(
  aluno: Aluno | null,
  onSucesso?: () => void
): UseEditarAlunoReturn {
  const [form, setForm] = useState<AlunoEditForm>(mapAlunoToForm(aluno));
  const [errors, setErrors] = useState<AlunoEditErrors>({});
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackSucesso, setFeedbackSucesso] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  useEffect(() => {
    setForm(mapAlunoToForm(aluno));
    setErrors({});
    setFeedbackErro(null);
    setFeedbackSucesso(false);
  }, [aluno]);

  useEffect(() => {
    let ativo = true;

    const carregarPlanos = async (): Promise<void> => {
      setLoadingPlanos(true);
      setFeedbackErro(null);

      try {
        const lista = await buscarPlanos();
        if (ativo) setPlanos(lista);
      } catch (error) {
        if (!ativo) return;
        const mensagem =
          error instanceof Error ? error.message : "Erro ao carregar planos";
        setFeedbackErro(mensagem);
      } finally {
        if (ativo) setLoadingPlanos(false);
      }
    };

    void carregarPlanos();

    return () => {
      ativo = false;
    };
  }, []);

  const handleChange = (campo: keyof AlunoEditForm, valor: string): void => {
    const valorTratado = campo === "telefone" ? mascararTelefone(valor) : valor;

    setForm((prev) => ({ ...prev, [campo]: valorTratado }));
    setErrors((prev) => ({ ...prev, [campo]: undefined }));
  };

  const handleSubmit = async (): Promise<void> => {
    const erros = validarFormularioEdicao(form);
    if (Object.keys(erros).length > 0) {
      setErrors(erros);
      return;
    }

    if (!aluno) {
      setFeedbackErro("Aluno não encontrado");
      return;
    }

    setErrors({});
    setFeedbackErro(null);
    setLoadingSubmit(true);

    try {
      await atualizarAluno(aluno.id, {
        nomeCompleto: form.nomeCompleto.trim(),
        email: form.email.trim(),
        telefone: form.telefone,
        peso: Number.parseFloat(form.peso.replace(",", ".")),
        altura: Number.parseFloat(form.altura.replace(",", ".")),
        objetivo: form.objetivo.trim(),
        planoId: form.planoId,
      });

      setFeedbackSucesso(true);
      await new Promise((res) => setTimeout(res, 1500));
      setFeedbackSucesso(false);
      onSucesso?.();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o aluno";
      setFeedbackErro(mensagem);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return {
    form,
    errors,
    planos,
    loadingPlanos,
    loadingSubmit,
    feedbackSucesso,
    feedbackErro,
    handleChange,
    handleSubmit,
  };
}
