"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { labelModulo, isModuloAlunoId } from "@/lib/modulos-aluno";

function Conteudo() {
  const params = useSearchParams();
  const m = params.get("m") ?? "";
  const nome = isModuloAlunoId(m) ? labelModulo(m) : "este módulo";

  return (
    <main className="page-main inativo-page">
      <div className="inativo-page-inner card">
        <LockKeyhole size={64} className="text-accent" aria-hidden />
        <h1>Módulo não contratado</h1>
        <p className="text-muted">
          Você não tem acesso a <strong>{nome}</strong> no plano atual. Contrate
          este módulo (ou um pacote com mais opções) para liberar novamente.
        </p>
        <div className="inativo-page-acoes">
          <Link href="/aluno/planos" className="btn-primary">
            Contratar módulos
          </Link>
          <Link href="/aluno/dashboard" className="btn-secondary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="page-main">
          <p className="text-muted">Carregando...</p>
        </main>
      }
    >
      <Conteudo />
    </Suspense>
  );
}
