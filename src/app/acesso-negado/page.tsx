"use client";

import { ArrowLeft, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <main className="status-page">
      <div className="status-page-inner">
        <ShieldOff size={64} className="text-accent" aria-hidden />

        <h1>Acesso negado</h1>

        <p className="text-muted">
          Você não tem permissão para acessar esta página.
        </p>

        <div className="action-row" style={{ width: "100%", marginTop: "8px" }}>
          <button type="button" className="btn-primary" onClick={() => router.back()}>
            <ArrowLeft size={18} />
            Voltar
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/login")}
          >
            Ir para o login
          </button>
        </div>
      </div>
    </main>
  );
}
