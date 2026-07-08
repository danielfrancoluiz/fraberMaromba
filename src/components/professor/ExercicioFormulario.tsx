"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { ExercicioMidia } from "@/components/exercicio/ExercicioMidia";
import { useExercicioForm } from "@/hooks/useExercicioForm";
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

interface ExercicioFormularioProps {
  exercicioId?: string;
}

export function ExercicioFormulario({ exercicioId }: ExercicioFormularioProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    form,
    errors,
    loadingSubmit,
    loadingDados,
    erroCarregar,
    feedbackSucesso,
    feedbackErro,
    modoEdicao,
    handleChange,
    toggleUnilateral,
    handleSubmit,
    loadingUpload,
    previewLocal,
    previewMime,
    enviarMidia,
    removerMidia,
  } = useExercicioForm({ exercicioId });

  const inputMidiaRef = useRef<HTMLInputElement>(null);
  const midiaSalvaUrl = form.gifUrl.trim() || null;

  const subGrupos = form.grupoMuscular
    ? subGruposDoMembro(normalizarGrupoMuscular(form.grupoMuscular))
    : [];

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "professor") {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || loadingDados) {
    return (
      <main className="page-main">
        <p className="loading-center text-muted">Carregando...</p>
      </main>
    );
  }

  if (!session || session.user.role !== "professor") {
    return null;
  }

  if (erroCarregar) {
    return (
      <main className="page-main">
        <div className="page-container page-stack">
          <PageTopBar
            title="Exercício"
            onBack={() => router.push("/professor/exercicios")}
          />
          <p className="error-center text-accent">{erroCarregar}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div className="page-container page-stack">
        <PageTopBar
          title={modoEdicao ? "Editar exercício" : "Novo exercício"}
          subtitle={
            modoEdicao
              ? "Atualize os dados do exercício"
              : "Cadastre no catálogo para usar nos treinos"
          }
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

          <Campo label="Vídeo / GIF" erro={errors.gifUrl} className="field-span2">
            <input
              ref={inputMidiaRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,image/gif,image/webp,image/png,image/jpeg"
              className="exercicio-midia-input-hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void enviarMidia(file);
                e.target.value = "";
              }}
            />
            <div className="exercicio-midia-upload-actions">
              <button
                type="button"
                className="btn-secondary exercicio-midia-upload-btn"
                disabled={loadingUpload}
                onClick={() => inputMidiaRef.current?.click()}
              >
                <Upload size={16} />
                {loadingUpload ? "Enviando..." : "Selecionar arquivo"}
              </button>
              {midiaSalvaUrl || previewLocal ? (
                <button
                  type="button"
                  className="btn-secondary exercicio-midia-upload-btn"
                  disabled={loadingUpload}
                  onClick={removerMidia}
                >
                  <Trash2 size={16} />
                  Remover
                </button>
              ) : null}
            </div>
            <p className="text-muted exercicio-midia-hint">
              MP4, WebM, MOV, GIF ou imagem — até 50 MB. O arquivo fica salvo no Supabase Storage.
            </p>
            {previewLocal ? (
              <div className="exercicio-form-preview">
                {previewMime?.startsWith("video/") ? (
                  <video
                    src={previewLocal}
                    className="exercicio-form-preview-media exercicio-midia--video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <img
                    src={previewLocal}
                    alt="Prévia do exercício"
                    className="exercicio-form-preview-media"
                  />
                )}
              </div>
            ) : midiaSalvaUrl ? (
              <div className="exercicio-form-preview">
                <ExercicioMidia
                  url={midiaSalvaUrl}
                  alt="Prévia do exercício"
                  mediaClassName="exercicio-form-preview-media"
                />
              </div>
            ) : (
              <div className="exercicio-form-preview exercicio-form-preview--empty">
                <ImageIcon size={28} />
                <span>Envie um vídeo ou GIF do exercício</span>
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

          <Campo label="Descanso (segundos)" erro={errors.descanso}>
            <input
              className="input-field"
              type="number"
              min={0}
              max={600}
              value={form.descanso}
              onChange={(e) => handleChange("descanso", e.target.value)}
            />
          </Campo>

          <div className="exercicio-unilateral-wrap">
            <span className="field-label">Lado do exercício</span>
            <button
              type="button"
              className={`chip exercicio-unilateral-btn ${form.unilateral ? "chip-active" : ""}`}
              onClick={toggleUnilateral}
              aria-pressed={form.unilateral}
            >
              Unilateral
            </button>
            <p className="text-muted exercicio-unilateral-hint">
              {form.unilateral
                ? "Marcado: trabalha um lado de cada vez"
                : "Desmarcado: exercício bilateral"}
            </p>
          </div>

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
            <button type="submit" className="btn-primary" disabled={loadingSubmit || loadingUpload}>
              {loadingSubmit
                ? "Salvando..."
                : modoEdicao
                  ? "Salvar alterações"
                  : "Criar exercício"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/** @deprecated Use ExercicioFormulario */
export const CriarExercicioForm = ExercicioFormulario;
