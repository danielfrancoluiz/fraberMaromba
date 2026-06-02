"use client";

import { useState } from "react";
import { treinosMock } from "@/mocks/treinosMock";

const STORAGE_KEYS = ["fraber_treinos", "fraber_alunos", "fraber_usuarios"] as const;
const SESSAO_KEY = "fraber_aluno_sessao";

const preStyle: React.CSSProperties = {
  background: "#132035",
  color: "#F0F4FF",
  fontSize: "12px",
  overflow: "auto",
  maxHeight: "400px",
  padding: "1rem",
  borderRadius: "8px",
  marginTop: "1rem",
  width: "100%",
  maxWidth: "800px",
  margin: "1rem auto 0",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const buttonStyle: React.CSSProperties = {
  background: "#2E7FD9",
  color: "#F0F4FF",
  border: "none",
  borderRadius: "8px",
  padding: "12px 24px",
  fontSize: "1rem",
  cursor: "pointer",
};

function parseStorageValue(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export default function Page() {
  const [localStorageContent, setLocalStorageContent] = useState<string | null>(null);
  const [sessaoContent, setSessaoContent] = useState<string | null>(null);
  const [mensagemSeed, setMensagemSeed] = useState<string | null>(null);

  function seedTreinos() {
    setMensagemSeed(null);

    const alunos = JSON.parse(localStorage.getItem("fraber_alunos") || "[]");

    if (!Array.isArray(alunos) || alunos.length === 0) {
      setMensagemSeed(
        "Nenhum aluno encontrado no localStorage. Cadastre um aluno pelo painel do professor primeiro."
      );
      return;
    }

    const alunoId = alunos[0].id;
    const existentes = JSON.parse(localStorage.getItem("fraber_treinos") || "[]");
    const ids = existentes.map((t: any) => t.id);
    const novos = treinosMock
      .filter((t) => !ids.includes(t.id))
      .map((t) => ({ ...t, alunoId }));

    localStorage.setItem("fraber_treinos", JSON.stringify([...existentes, ...novos]));
    alert(`${novos.length} treino(s) adicionado(s) com sucesso!`);
  }

  function inspecionarLocalStorage() {
    const dados: Record<string, unknown> = {};

    for (const chave of STORAGE_KEYS) {
      dados[chave] = parseStorageValue(localStorage.getItem(chave));
    }

    setLocalStorageContent(JSON.stringify(dados, null, 2));
  }

  function verSessao() {
    const raw = sessionStorage.getItem(SESSAO_KEY);
    const valor = parseStorageValue(raw);
    setSessaoContent(JSON.stringify({ [SESSAO_KEY]: valor }, null, 2));
  }

  return (
    <main
      style={{
        background: "#0D1B2E",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1.5rem",
      }}
    >
      <p style={{ color: "#F0F4FF", fontSize: "1.2rem" }}>
        Página de Seeds — apenas para desenvolvimento
      </p>
      <button onClick={seedTreinos} style={buttonStyle}>
        Injetar Treinos Mock
      </button>

      {mensagemSeed ? (
        <p
          style={{
            color: "#E8001C",
            fontSize: "0.95rem",
            textAlign: "center",
            maxWidth: "420px",
            margin: 0,
          }}
        >
          {mensagemSeed}
        </p>
      ) : null}

      <button onClick={inspecionarLocalStorage} style={buttonStyle}>
        Inspecionar localStorage
      </button>

      {localStorageContent !== null ? (
        <pre style={preStyle}>{localStorageContent}</pre>
      ) : null}

      <button onClick={verSessao} style={buttonStyle}>
        Ver Sessão
      </button>

      {sessaoContent !== null ? (
        <pre style={preStyle}>{sessaoContent}</pre>
      ) : null}
    </main>
  );
}
