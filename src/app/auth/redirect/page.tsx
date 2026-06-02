"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    const { role, status: userStatus } = session.user;

    if (role === "professor") {
      router.replace("/professor/dashboard");
      return;
    }

    if (role === "aluno") {
      if (userStatus === "ativo_professor" || userStatus === "ativo_plataforma") {
        router.replace("/aluno/dashboard");
      } else {
        router.replace("/aluno/inativo");
      }
    }
  }, [session, status, router]);

  return (
    <main
      style={{
        backgroundColor: "#0D1B2E",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        color: "#7A9CC4",
      }}
    >
      Redirecionando...
    </main>
  );
}
