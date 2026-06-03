"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Treino } from "@/types";
import { listarTreinosDoAlunoPorDia } from "@/services/alunoService";
import { useTreinoExecucao } from "@/hooks/useTreinoExecucao";
import { ExercicioItem } from "@/components/aluno/ExercicioItem";
import { TimerDescanso } from "@/components/aluno/TimerDescanso";
import { SubstitutoPanel } from "@/components/aluno/SubstitutoPanel";
import { CheckinButton } from "@/components/aluno/CheckinButton";
import { LogoutButton } from "@/components/LogoutButton";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;

  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    listarTreinosDoAlunoPorDia(session.user.id).then((porDia) => {
      const todos = Object.values(porDia).flat();
      const encontrado = todos.find((t) => t.id === id) ?? null;
      setTreino(encontrado);
      setLoading(false);
    });
  }, [id, session?.user?.id]);

  const {
    exerciciosConcluidos,
    timerSegundos,
    timerAtivo,
    timerCustom,
    setTimerCustom,
    iniciarTimer,
    pausarTimer,
    resetarTimer,
    marcarConcluido,
    desmarcarConcluido,
    todosConcluidos,
    exercicioSubstituindo,
    setExercicioSubstituindo,
    substitutos,
    loadingSubstitutos,
    substituirExercicio,
  } = useTreinoExecucao(treino, session?.user?.id ?? "");

  const diasLabel: Record<string, string> = {
    segunda: "Segunda",
    terca: "Terça",
    quarta: "Quarta",
    quinta: "Quinta",
    sexta: "Sexta",
    sabado: "Sábado",
    domingo: "Domingo",
  };

  if (loading)
    return (
      <main
        style={{
          background: "#0D1B2E",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#7A9CC4" }}>Carregando treino...</p>
      </main>
    );

  if (!treino)
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
        }}
      >
        <p style={{ color: "#F0F4FF" }}>Treino não encontrado.</p>
        <button
          onClick={() => router.push("/aluno/dashboard")}
          style={{
            background: "#2E7FD9",
            color: "#F0F4FF",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          Voltar ao Dashboard
        </button>
      </main>
    );

  return (
    <main
      style={{
        background: "#0D1B2E",
        minHeight: "100vh",
        width: "100%",
        padding: "1rem 1rem 4rem",
      }}
    >
      <style>{`
        .treino-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .treino-container {
            max-width: 600px;
          }
        }

        @media (min-width: 1024px) {
          .treino-container {
            max-width: 800px;
          }
        }
      `}</style>

      <div className="treino-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#F0F4FF",
              padding: "8px",
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ color: "#F0F4FF", margin: 0, fontSize: "1.3rem" }}>
              {treino.nome}
            </h1>
            <span
              style={{
                background: "#2E7FD9",
                color: "#F0F4FF",
                borderRadius: "999px",
                padding: "2px 10px",
                fontSize: "0.75rem",
              }}
            >
              {diasLabel[treino.diaSemana] ?? treino.diaSemana}
            </span>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <CheckinButton treinoId={treino.id} />
      </div>

      <div
        style={{
          background: "#132035",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <p style={{ color: "#7A9CC4", margin: "0 0 8px" }}>
          {exerciciosConcluidos.length} de {treino.exercicios.length} exercícios concluídos
        </p>
        <div
          style={{
            background: "#1E3050",
            borderRadius: "999px",
            height: "8px",
          }}
        >
          <div
            style={{
              background: "#2E7FD9",
              borderRadius: "999px",
              height: "8px",
              width: `${(exerciciosConcluidos.length / treino.exercicios.length) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <TimerDescanso
        segundos={timerSegundos}
        ativo={timerAtivo}
        timerCustom={timerCustom}
        onIniciar={iniciarTimer}
        onPausar={pausarTimer}
        onResetar={resetarTimer}
        onChangeCustom={setTimerCustom}
      />

      {exercicioSubstituindo && (
        <SubstitutoPanel
          substitutos={substitutos}
          loading={loadingSubstitutos}
          onSelecionar={(s) => {
            substituirExercicio(exercicioSubstituindo, s);
            setExercicioSubstituindo(null);
          }}
          onCancelar={() => setExercicioSubstituindo(null)}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginTop: "1rem",
        }}
      >
        {treino.exercicios.map((ex) => (
          <ExercicioItem
            key={ex.id}
            exercicio={ex}
            concluido={exerciciosConcluidos.includes(ex.id)}
            onMarcar={() => marcarConcluido(ex.id)}
            onDesmarcar={() => desmarcarConcluido(ex.id)}
            onSubstituir={() => setExercicioSubstituindo(ex.id)}
          />
        ))}
      </div>

      {todosConcluidos && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p style={{ color: "#2E7FD9", fontSize: "1.5rem", fontWeight: "bold" }}>
            🎉 Treino concluído! Parabéns!
          </p>
          <button
            onClick={() => router.push("/aluno/dashboard")}
            style={{
              background: "#2E7FD9",
              color: "#F0F4FF",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
              fontSize: "1rem",
              marginTop: "1rem",
            }}
          >
            Voltar ao Dashboard
          </button>
        </div>
      )}
      </div>
    </main>
  );
}
