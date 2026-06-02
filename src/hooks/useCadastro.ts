import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Convite } from "@/types";
import { buscarConvitePorToken } from "@/services/professorService";
import { validarEmail, validarNomeCompleto } from "@/utils/validators";

interface CadastroForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

interface CadastroErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  geral?: string;
}

interface CadastroApiError {
  error?: string;
}

interface UseCadastroReturn {
  form: CadastroForm;
  errors: CadastroErrors;
  convite: Convite | null;
  loadingConvite: boolean;
  loadingSubmit: boolean;
  feedbackErro: string | null;
  handleChange: (campo: string, valor: string) => void;
  handleSubmit: () => Promise<void>;
}

export function useCadastro(tokenConvite?: string): UseCadastroReturn {
  const router = useRouter();
  const [form, setForm] = useState<CadastroForm>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<CadastroErrors>({});
  const [convite, setConvite] = useState<Convite | null>(null);
  const [loadingConvite, setLoadingConvite] = useState(!!tokenConvite);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenConvite) {
      setLoadingConvite(false);
      return;
    }

    let ativo = true;

    const carregarConvite = async (): Promise<void> => {
      setLoadingConvite(true);

      try {
        const conviteEncontrado = await buscarConvitePorToken(tokenConvite);

        if (!ativo) return;

        if (!conviteEncontrado) {
          setFeedbackErro("Link de convite inválido.");
          return;
        }

        if (conviteEncontrado.usado) {
          setFeedbackErro("Este link de convite já foi utilizado.");
          return;
        }

        setConvite(conviteEncontrado);

        if (conviteEncontrado.email) {
          setForm((prev) => ({
            ...prev,
            email: conviteEncontrado.email ?? prev.email,
          }));
        }
      } finally {
        if (ativo) {
          setLoadingConvite(false);
        }
      }
    };

    void carregarConvite();

    return () => {
      ativo = false;
    };
  }, [tokenConvite]);

  const handleChange = (campo: string, valor: string): void => {
    if (campo === "email" && convite?.email) return;

    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setErrors((prev) => ({
      ...prev,
      [campo]: undefined,
      geral: undefined,
    }));
  };

  const validarFormulario = (): CadastroErrors => {
    const novosErros: CadastroErrors = {};

    if (!form.nome.trim()) {
      novosErros.nome = "Campo obrigatório";
    } else if (!validarNomeCompleto(form.nome)) {
      novosErros.nome = "Informe nome e sobrenome";
    }

    if (!form.email.trim()) {
      novosErros.email = "Campo obrigatório";
    } else if (!validarEmail(form.email)) {
      novosErros.email = "Email inválido";
    }

    if (!form.senha) {
      novosErros.senha = "Campo obrigatório";
    } else if (form.senha.length < 6) {
      novosErros.senha = "Mínimo de 6 caracteres";
    }

    if (!form.confirmarSenha) {
      novosErros.confirmarSenha = "Campo obrigatório";
    } else if (form.confirmarSenha !== form.senha) {
      novosErros.confirmarSenha = "As senhas não coincidem";
    }

    return novosErros;
  };

  const handleSubmit = async (): Promise<void> => {
    if (tokenConvite && feedbackErro) return;

    const novosErros = validarFormulario();
    setErrors(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    setLoadingSubmit(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          tokenConvite,
        }),
      });

      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const mensagem =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as CadastroApiError).error === "string"
            ? (body as CadastroApiError).error
            : "Erro ao cadastrar usuário";

        setErrors({ geral: mensagem });
        return;
      }

      router.push("/login?cadastro=sucesso");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return {
    form,
    errors,
    convite,
    loadingConvite,
    loadingSubmit,
    feedbackErro,
    handleChange,
    handleSubmit,
  };
}
