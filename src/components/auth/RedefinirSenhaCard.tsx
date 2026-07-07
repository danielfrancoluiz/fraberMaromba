"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface RedefinirSenhaCardProps {
  titulo?: string;
}

export function RedefinirSenhaCard({ titulo = "Redefinir senha" }: RedefinirSenhaCardProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/senha", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha, confirmarSenha }),
      });

      const data: unknown = await res.json().catch(() => null);
      const mensagem =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error?: string }).error === "string"
          ? (data as { error: string }).error
          : null;

      if (!res.ok) {
        setErro(mensagem ?? "Não foi possível alterar a senha");
        return;
      }

      setSucesso("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card redefinir-senha-card">
      <div className="redefinir-senha-header">
        <Lock size={18} />
        <h2 className="redefinir-senha-title">{titulo}</h2>
      </div>
      <p className="text-muted redefinir-senha-desc">
        Use sua senha atual para definir uma nova senha de acesso.
      </p>

      <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <label className="field-label" htmlFor="senha-atual">
            Senha atual
          </label>
          <div className="input-wrap-icon">
            <input
              id="senha-atual"
              type={mostrarSenhaAtual ? "text" : "password"}
              className="input-field"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setMostrarSenhaAtual((v) => !v)}
              aria-label={mostrarSenhaAtual ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenhaAtual ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="nova-senha">
            Nova senha
          </label>
          <div className="input-wrap-icon">
            <input
              id="nova-senha"
              type={mostrarNovaSenha ? "text" : "password"}
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
              onClick={() => setMostrarNovaSenha((v) => !v)}
              aria-label={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarNovaSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="confirmar-senha">
            Confirmar nova senha
          </label>
          <input
            id="confirmar-senha"
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
        {sucesso ? (
          <p className="auth-alert auth-alert--success" style={{ margin: 0 }}>
            {sucesso}
          </p>
        ) : null}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
