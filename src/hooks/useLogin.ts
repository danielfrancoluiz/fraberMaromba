import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import type { Session } from "next-auth";

function redirectBySession(session: Session, router: ReturnType<typeof useRouter>): void {
  const { role, status } = session.user;

  if (role === "professor") {
    router.push("/professor/dashboard");
    return;
  }

  if (role === "aluno") {
    if (status === "ativo_professor" || status === "ativo_plataforma") {
      router.push("/aluno/dashboard");
    } else {
      router.push("/aluno/inativo");
    }
  }
}

interface UseLoginReturn {
  email: string;
  senha: string;
  loading: boolean;
  loadingGoogle: boolean;
  erro: string | null;
  setEmail: (v: string) => void;
  setSenha: (v: string) => void;
  handleLogin: () => Promise<void>;
  handleGoogle: () => Promise<void>;
}

export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    setErro(null);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        senha,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        const detalhe = result?.error?.trim();
        if (detalhe && detalhe !== "CredentialsSignin") {
          setErro(detalhe);
        } else {
          setErro("Email ou senha incorretos");
        }
        return;
      }

      const session = await getSession();
      if (session) {
        redirectBySession(session, router);
        return;
      }

      router.push("/auth/redirect");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (): Promise<void> => {
    setLoadingGoogle(true);
    setErro(null);

    try {
      await signIn("google", { callbackUrl: "/auth/redirect" });
    } catch {
      setLoadingGoogle(false);
    }
  };

  return {
    email,
    senha,
    loading,
    loadingGoogle,
    erro,
    setEmail,
    setSenha,
    handleLogin,
    handleGoogle,
  };
}
