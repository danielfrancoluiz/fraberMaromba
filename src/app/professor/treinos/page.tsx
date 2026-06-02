"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTreinosTemplate } from "@/hooks/useTreinosTemplate";
import { TemplateCard } from "@/components/professor/TemplateCard";

export default function Page() {
  const router = useRouter();
  const { templates, loading } = useTreinosTemplate();

  return (
    <main
      style={{
        backgroundColor: "#0D1B2E",
        minHeight: "100vh",
        padding: "1.5rem 1rem 6rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gap: "1rem" }}>
        <header style={{ display: "grid", gap: "10px" }}>
          <button
            type="button"
            onClick={() => router.push("/professor/dashboard")}
            style={{
              minHeight: "40px",
              minWidth: "40px",
              width: "fit-content",
              borderRadius: "10px",
              border: "1px solid #1E3050",
              backgroundColor: "#132035",
              color: "#F0F4FF",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0, color: "#F0F4FF", fontSize: "1.5rem" }}>Meus Templates</h1>
            <p style={{ margin: "4px 0 0", color: "#7A9CC4" }}>Treinos reutilizáveis</p>
          </div>
        </header>

        {loading ? (
          <p style={{ margin: "2rem 0", textAlign: "center", color: "#7A9CC4" }}>Carregando...</p>
        ) : templates.length === 0 ? (
          <p style={{ margin: "2rem 0", textAlign: "center", color: "#7A9CC4" }}>
            Nenhum template criado ainda.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
            }}
            className="templates-grid"
          >
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onAtribuir={() =>
                  alert("Acesse o perfil do aluno para atribuir este template.")
                }
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/professor/treinos/novo")}
        style={{
          position: "fixed",
          right: "16px",
          bottom: "24px",
          minHeight: "48px",
          border: "none",
          borderRadius: "9999px",
          backgroundColor: "#2E7FD9",
          color: "#F0F4FF",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          padding: "12px 16px",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.28)",
        }}
      >
        <Plus size={18} />+ Novo Template
      </button>

      <style jsx global>{`
        @media (min-width: 768px) {
          .templates-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 1024px) {
          .templates-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </main>
  );
}
