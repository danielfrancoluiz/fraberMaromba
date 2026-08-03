import { NextRequest, NextResponse } from "next/server";
import { requireProfessorSession } from "@/lib/get-api-session";
import { criarUploadAssinadoExercicio } from "@/lib/exercicio-storage";

interface UploadMetaBody {
  fileName?: unknown;
  contentType?: unknown;
  size?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireProfessorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await req.json()) as UploadMetaBody;
    const fileName = typeof body.fileName === "string" ? body.fileName : "";
    const contentType =
      typeof body.contentType === "string" ? body.contentType : "";
    const size = typeof body.size === "number" ? body.size : Number(body.size);

    if (!fileName || !Number.isFinite(size)) {
      return NextResponse.json(
        { error: "Informe nome e tamanho do arquivo" },
        { status: 400 }
      );
    }

    const upload = await criarUploadAssinadoExercicio(session.user.id, {
      name: fileName,
      type: contentType,
      size,
    });

    return NextResponse.json(upload);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao preparar upload";
    console.error("[POST /api/professor/exercicios/upload]", error);
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
