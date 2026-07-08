export async function uploadMidiaExercicioProfessor(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/professor/exercicios/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const erro =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: string }).error === "string"
        ? (body as { error: string }).error
        : "Erro ao enviar arquivo";
    throw new Error(erro);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
