"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Treino } from "@/types";
import { listarTreinosDoAlunoPorDia } from "@/services/alunoService";
import { WorkoutExecution } from "@/components/aluno/WorkoutExecution";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;

  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    let ativo = true;

    const carregar = async (): Promise<void> => {
      setLoading(true);
      setErro(null);
      try {
        const porDia = await listarTreinosDoAlunoPorDia(session.user.id);
        const todos = Object.values(porDia).flat();
        const encontrado = todos.find((t) => t.id === id) ?? null;
        if (ativo) setTreino(encontrado);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error ? error.message : "Erro ao carregar treino"
          );
          setTreino(null);
        }
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [id, session?.user?.id]);

  if (loading) {
    return (
      <main className="workout-exec workout-exec-center">
        <p className="text-muted">Carregando treino...</p>
      </main>
    );
  }

  if (erro || !treino) {
    return (
      <main className="workout-exec workout-exec-center">
        <p className="text-accent">{erro ?? "Treino não encontrado."}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => router.push("/aluno/dashboard")}
        >
          Voltar ao início
        </button>
      </main>
    );
  }

  return (
    <WorkoutExecution
      treino={treino}
      alunoId={session?.user?.id ?? ""}
      onSair={() => router.back()}
      onFinalizar={() => router.push("/aluno/dashboard")}
    />
  );
}
