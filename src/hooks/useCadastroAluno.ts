import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CadastroAlunoForm, FormErrors, Plano } from "@/types";
import { cadastrarAluno, buscarPlanos } from "@/services/professorService";
import { validarFormulario, mascararCPF, mascararTelefone } from "@/utils/validators";

interface UseCadastroAlunoReturn {
  form: CadastroAlunoForm;
  errors: FormErrors;
  planos: Plano[];
  loadingPlanos: boolean;
  loadingSubmit: boolean;
  feedbackSucesso: boolean;
  feedbackErro: string | null;
  handleChange: (campo: keyof CadastroAlunoForm, valor: string) => void;
  handleSubmit: () => Promise<void>;
}

const FORM_INICIAL: CadastroAlunoForm = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  telefone: "",
  sexo: "",
  dataNascimento: "",
  peso: "",
  altura: "",
  objetivo: "",
  planoId: "",
};

export function useCadastroAluno(): UseCadastroAlunoReturn {
  const router = useRouter();

  const [form, setForm] = useState<CadastroAlunoForm>(FORM_INICIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackSucesso, setFeedbackSucesso] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    const carregarPlanos = async (): Promise<void> => {
      setLoadingPlanos(true);
      setFeedbackErro(null);

      try {
        const resultado = await buscarPlanos();
        if (ativo) {
          setPlanos(resultado);
        }
      } catch (error) {
        if (ativo) {
          const mensagem =
            error instanceof Error ? error.message : "Erro ao carregar planos";
          setFeedbackErro(mensagem);
        }
      } finally {
        if (ativo) {
          setLoadingPlanos(false);
        }
      }
    };

    carregarPlanos();

    return () => {
      ativo = false;
    };
  }, []);

  const handleChange = (campo: keyof CadastroAlunoForm, valor: string): void => {
    let valorTratado = valor;

    if (campo === "cpf") {
      valorTratado = mascararCPF(valor);
    } else if (campo === "telefone") {
      valorTratado = mascararTelefone(valor);
    }

    setForm((prev) => ({
      ...prev,
      [campo]: valorTratado,
    }));

    setErrors((prev) => {
      if (!prev[campo]) return prev;
      return { ...prev, [campo]: undefined };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const erros = validarFormulario(form);
    if (Object.keys(erros).length > 0) {
      setErrors(erros);
      return;
    }

    setErrors({});
    setLoadingSubmit(true);
    setFeedbackErro(null);

    try {
      await cadastrarAluno({
        nomeCompleto: form.nomeCompleto.trim(),
        cpf: form.cpf,
        email: form.email.trim(),
        telefone: form.telefone,
        sexo: form.sexo as "masculino" | "feminino" | "outro",
        dataNascimento: form.dataNascimento,
        peso: Number.parseFloat(form.peso.replace(",", ".")),
        altura: Number.parseFloat(form.altura.replace(",", ".")),
        objetivo: form.objetivo.trim(),
        planoId: form.planoId,
      });

      setFeedbackSucesso(true);
      await new Promise((res) => setTimeout(res, 1500));
      router.push("/professor/dashboard");
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o aluno";
      setFeedbackErro(mensagem);
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
