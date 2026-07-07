"use client";

import { use } from "react";
import { ExercicioFormulario } from "@/components/professor/ExercicioFormulario";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ExercicioFormulario exercicioId={id} />;
}
