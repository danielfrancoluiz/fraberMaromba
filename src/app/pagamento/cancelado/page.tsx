"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function Page() {
  return (
    <main className="status-page">
      <div className="status-page-inner">
        <XCircle size={64} className="text-accent" aria-hidden />
        <h1>Pagamento cancelado</h1>
        <p className="text-muted">Nenhuma cobrança foi realizada.</p>
        <div className="action-row" style={{ width: "100%", marginTop: "8px" }}>
          <Link href="/aluno/dashboard" className="btn-primary">
            Tentar novamente
          </Link>
          <button type="button" className="btn-secondary" onClick={() => window.close()}>
            Fechar esta aba
          </button>
        </div>
      </div>
    </main>
  );
}
