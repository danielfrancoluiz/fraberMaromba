import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { hashSenha, validarNovaSenha } from "@/lib/senha";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim() ?? "";
    if (!token) {
      return NextResponse.json({ valido: false, error: "Token ausente" }, { status: 400 });
    }

    const registro = await prisma.tokenRedefinirSenha.findUnique({
      where: { token },
      include: { usuario: { select: { email: true } } },
    });

    if (!registro || registro.usado || registro.expiraEm < new Date()) {
      return NextResponse.json({
        valido: false,
        error: "Link inválido ou expirado. Solicite um novo.",
      });
    }

    return NextResponse.json({
      valido: true,
      email: registro.usuario.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
    });
  } catch (error) {
    console.error("[GET /api/auth/redefinir-senha]", error);
    return NextResponse.json(
      { valido: false, error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}

interface RedefinirSenhaBody {
  token: string;
  novaSenha: string;
  confirmarSenha: string;
}

function isRedefinirSenhaBody(value: unknown): value is RedefinirSenhaBody {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.token === "string" &&
    typeof dados.novaSenha === "string" &&
    typeof dados.confirmarSenha === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!isRedefinirSenhaBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    if (body.novaSenha !== body.confirmarSenha) {
      return NextResponse.json({ error: "As senhas não coincidem" }, { status: 400 });
    }

    const erroSenha = validarNovaSenha(body.novaSenha);
    if (erroSenha) {
      return NextResponse.json({ error: erroSenha }, { status: 400 });
    }

    const registro = await prisma.tokenRedefinirSenha.findUnique({
      where: { token: body.token.trim() },
    });

    if (!registro || registro.usado || registro.expiraEm < new Date()) {
      return NextResponse.json(
        { error: "Link inválido ou expirado. Solicite um novo." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: registro.usuarioId },
        data: { senha: await hashSenha(body.novaSenha) },
      }),
      prisma.tokenRedefinirSenha.update({
        where: { id: registro.id },
        data: { usado: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      mensagem: "Senha redefinida com sucesso. Faça login com a nova senha.",
    });
  } catch (error) {
    console.error("[POST /api/auth/redefinir-senha]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
