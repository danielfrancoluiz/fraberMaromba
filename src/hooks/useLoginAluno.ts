import { useState } from "react";
import { useRouter } from "next/navigation";
import { autenticarAluno } from "@/mocks/alunosMock";

const SESSAO_KEY = "fraber_aluno_sessao";

interface UseLoginAlunoReturn {
  email: string;
  senha: string;
  erro: string | null;
  loading: boolean;
  setEmail: (v: string) => void;
  setSenha: (v: string) => void;
  handleLogin: () => Promise<void>;
}

export function useLoginAluno(): UseLoginAlunoReturn {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    setErro(null);

    try {
      const aluno = autenticarAluno(email.trim(), senha);

      if (!aluno) {
        setErro("Email ou senha incorretos");
        return;
      }

      sessionStorage.setItem(SESSAO_KEY, JSON.stringify(aluno));
      router.push("/aluno/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    senha,
    erro,
    loading,
    setEmail,
    setSenha,
    handleLogin,
  };
}
