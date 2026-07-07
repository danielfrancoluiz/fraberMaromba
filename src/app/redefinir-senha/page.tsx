"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [emailMascarado, setEmailMascarado] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidando(false);
      setTokenValido(false);
      setErro("Link inválido. Solicite um novo.");
      return;
    }

    let ativo = true;
    void fetch(`/api/auth/redefinir-senha?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          valido?: boolean;
          email?: string;
          error?: string;
        };
        if (!ativo) return;
        setTokenValido(Boolean(data.valido));
        if (data.email) setEmailMascarado(data.email);
        if (!data.valido) setErro(data.error ?? "Link inválido ou expirado.");
      })
      .catch(() => {
        if (ativo) setErro("Erro ao validar o link.");
      })
      .finally(() => {
        if (ativo) setValidando(false);
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha, confirmarSenha }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        mensagem?: string;
      } | null;

      if (!res.ok) {
        setErro(data?.error ?? "Não foi possível redefinir a senha");
        return;
      }

      setSucesso(data?.mensagem ?? "Senha redefinida com sucesso!");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo-wrap">
          <Logo size={96} showText />
        </div>

        <p className="auth-subtitle">Nova senha</p>

        {validando ? (
          <p className="text-muted">Validando link...</p>
        ) : !tokenValido ? (
          <>
            <p className="field-error">{erro}</p>
            <p className="auth-footer">
              <Link href="/esqueci-senha">Solicitar novo link</Link>
            </p>
          </>
        ) : sucesso ? (
          <p className="auth-alert auth-alert--success">{sucesso}</p>
        ) : (
          <>
            {emailMascarado ? (
              <p className="text-muted" style={{ margin: "0 0 1rem", fontSize: "0.875rem" }}>
                Conta: {emailMascarado}
              </p>
            ) : null}

            <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
              <div>
                <label className="field-label" htmlFor="reset-nova-senha">
                  Nova senha
                </label>
                <div className="input-wrap-icon">
                  <input
                    id="reset-nova-senha"
                    type={mostrarSenha ? "text" : "password"}
                    className="input-field"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setMostrarSenha((v) => !v)}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="reset-confirmar-senha">
                  Confirmar nova senha
                </label>
                <input
                  id="reset-confirmar-senha"
                  type="password"
                  className="input-field"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              {erro ? <p className="field-error">{erro}</p> : null}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer">
          <Link href="/login">Voltar ao login</Link>
        </p>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <Logo size={80} />
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <RedefinirSenhaContent />
    </Suspense>
  );
}
