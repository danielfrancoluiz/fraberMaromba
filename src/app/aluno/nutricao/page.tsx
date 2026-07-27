"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ExternalLink, Salad } from "lucide-react";
import { OfertasContratar } from "@/components/pagamento/OfertasContratar";
import {
  FORMULARIO_NUTRICAO_URL,
  FORMULARIO_NUTRICAO_URL_ABRIR,
} from "@/lib/ofertas-planos";

type Contratacao = {
  id: string;
  nome: string;
  grupo: string;
  valor: number;
};

export default function Page() {
  const { data: session } = useSession();
  const alunoId = session?.user?.alunoId ?? "";
  const temNutricao = (session?.user?.modulosAtivos ?? []).includes("nutricao");
  const [contratacoesNutri, setContratacoesNutri] = useState<Contratacao[]>([]);

  useEffect(() => {
    if (!alunoId) return;
    let ativo = true;
    void fetch(`/api/pagamentos?alunoId=${encodeURIComponent(alunoId)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((body: unknown) => {
        if (!ativo || !body || typeof body !== "object") return;
        const contratacoes = (body as { contratacoes?: Contratacao[] })
          .contratacoes;
        if (Array.isArray(contratacoes)) {
          setContratacoesNutri(
            contratacoes.filter((c) => c.grupo === "nutricao")
          );
        }
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [alunoId]);

  const mostrarForm = temNutricao || contratacoesNutri.length > 0;

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <header className="corrida-aluno-header">
          <div className="corrida-aluno-title-row">
            <Salad size={22} aria-hidden />
            <div>
              <h1 className="page-header-title" style={{ margin: 0 }}>
                Nutrição
              </h1>
              <p
                className="text-muted"
                style={{ margin: "2px 0 0", fontSize: "0.85rem" }}
              >
                Planos alimentares e anamnese
              </p>
            </div>
          </div>
        </header>

        {contratacoesNutri.length > 0 ? (
          <section className="card">
            <p className="field-label" style={{ marginBottom: 8 }}>
              Você contratou
            </p>
            <ul className="historico-pagamentos-lista">
              {contratacoesNutri.map((c) => (
                <li key={c.id} className="historico-pagamentos-item">
                  <strong>{c.nome}</strong>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {mostrarForm ? (
          <section className="card nutricao-form-card">
            <h2 style={{ margin: "0 0 8px", fontSize: "1.05rem" }}>
              Anamnese nutricional
            </h2>
            <p
              className="text-muted"
              style={{ margin: "0 0 12px", fontSize: "0.9rem" }}
            >
              Preencha o formulário para o nutricionista. É um Google Forms
              externo — se alguém alterar o form lá, esta tela acompanha.
            </p>
            <div className="nutricao-form-frame-wrap">
              <iframe
                title="Formulário de anamnese nutricional"
                src={FORMULARIO_NUTRICAO_URL}
                className="nutricao-form-frame"
                loading="lazy"
              />
            </div>
            <a
              href={FORMULARIO_NUTRICAO_URL_ABRIR}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ marginTop: 12, display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              <ExternalLink size={16} />
              Abrir em nova aba
            </a>
          </section>
        ) : null}

        {alunoId ? (
          <OfertasContratar
            alunoId={alunoId}
            grupo="nutricao"
            titulo="Contratar nutrição"
            modulosAtuais={session?.user?.modulosAtivos ?? []}
          />
        ) : (
          <p className="text-muted">Faça login como aluno para contratar.</p>
        )}
      </div>
    </main>
  );
}
