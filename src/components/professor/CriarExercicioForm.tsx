"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ImageIcon } from "lucide-react";
import { useCriarExercicio } from "@/hooks/useCriarExercicio";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { GRUPOS_MUSCULARES } from "@/lib/grupos-musculares";
import { subGruposDoMembro } from "@/lib/sub-grupos-musculares";
import { normalizarGrupoMuscular } from "@/lib/grupos-musculares";

interface CampoProps {
  label: string;
  children: React.ReactNode;
  erro?: string;
  className?: string;
}

function Campo({ label, children, erro, className }: CampoProps) {
  return (
    <div className={className}>
      <label className="field-label">{label}</label>
      {children}
      {erro ? <p className="field-error">{erro}</p> : null}
    </div>
  );
}

export function CriarExercicioForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    form,
    errors,
    loadingSubmit,
    feedbackSucesso,
    feedbackErro,
    handleChange,
    handleSubmit,
  } = useCriarExercicio();

  const subGrupos = form.grupoMuscular
    ? subGruposDoMembro(normalizarGrupoMuscular(form.grupoMuscular))
    : [];

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "professor") {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <main className="page-main">
        <p className="loading-center text-muted">Carregando...</p>
      </main>
    );
  }

  if (!session || session.user.role !== "professor") {
    return null;
  }

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title="Novo exercício"
          subtitle="Cadastre no catálogo para usar nos treinos"
          onBack={() => router.push("/professor/exercicios")}
        />

        <form
          className="form-grid form-grid--2 card"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit().then((ok) => {
              if (ok) {
                setTimeout(() => router.push("/professor/exercicios"), 800);
              }
            });
          }}
        >
          <Campo label="Nome do exercício" erro={errors.nome} className="field-span2">
            <input
              className="input-field"
              placeholder="Ex: Supino inclinado com halteres"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
            />
          </Campo>

          <Campo label="Vídeo / GIF (URL)" erro={errors.gifUrl} className="field-span2">
            <input
              className="input-field"
              placeholder="https://exemplo.com/exercicio.gif"
              value={form.gifUrl}
              onChange={(e) => handleChange("gifUrl", e.target.value)}
            />
            {form.gifUrl.trim() ? (
              <div className="exercicio-form-preview">
                <img
                  src={form.gifUrl.trim()}
                  alt="Prévia do exercício"
                  className="exercicio-form-preview-media"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="exercicio-form-preview exercicio-form-preview--empty">
                <ImageIcon size={28} />
                <span>Cole o link do GIF ou vídeo</span>
              </div>
            )}
          </Campo>

          <Campo label="Membro" erro={errors.grupoMuscular}>
            <select
              className="input-field"
              value={form.grupoMuscular}
              onChange={(e) => handleChange("grupoMuscular", e.target.value)}
            >
              <option value="">Selecione</option>
              {GRUPOS_MUSCULARES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Sub-membro" erro={errors.subGrupoMuscular}>
            <select
              className="input-field"
              value={form.subGrupoMuscular}
              onChange={(e) => handleChange("subGrupoMuscular", e.target.value)}
              disabled={!form.grupoMuscular || subGrupos.length === 0}
            >
              <option value="">
                {!form.grupoMuscular
                  ? "Selecione o membro primeiro"
                  : subGrupos.length === 0
                    ? "N/A"
                    : "Selecione"}
              </option>
              {subGrupos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Séries" erro={errors.series}>
            <input
              className="input-field"
              type="number"
              min={1}
              max={99}
              value={form.series}
              onChange={(e) => handleChange("series", e.target.value)}
            />
          </Campo>

          <Campo label="Repetições" erro={errors.repeticoes}>
            <input
              className="input-field"
              type="number"
              min={1}
              max={999}
              value={form.repeticoes}
              onChange={(e) => handleChange("repeticoes", e.target.value)}
            />
          </Campo>

          <Campo label="Descanso (segundos)" erro={errors.descanso} className="field-span2">
            <input
              className="input-field"
              type="number"
              min={0}
              max={600}
              value={form.descanso}
              onChange={(e) => handleChange("descanso", e.target.value)}
            />
          </Campo>

          {feedbackSucesso ? (
            <p className="field-span2 auth-alert auth-alert--success">{feedbackSucesso}</p>
          ) : null}
          {feedbackErro ? (
            <p className="field-error field-span2" style={{ margin: 0 }}>
              {feedbackErro}
            </p>
          ) : null}

          <div className="form-actions field-span2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/professor/exercicios")}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loadingSubmit}>
              {loadingSubmit ? "Salvando..." : "Criar exercício"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
