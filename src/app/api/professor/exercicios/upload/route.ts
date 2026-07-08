import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { enviarMidiaExercicio } from "@/lib/exercicio-storage";

export async function POST(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const arquivo = formData.get("file");

    if (!(arquivo instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo de vídeo ou GIF" }, { status: 400 });
    }

    const url = await enviarMidiaExercicio(arquivo, session.user.id);

    return NextResponse.json({ url });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao enviar arquivo";
    console.error("[POST /api/professor/exercicios/upload]", error);
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
