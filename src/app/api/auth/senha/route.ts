import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-api-session";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { hashSenha, senhaConfere, validarNovaSenha } from "@/lib/senha";

interface AlterarSenhaBody {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

function isAlterarSenhaBody(value: unknown): value is AlterarSenhaBody {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.senhaAtual === "string" &&
    typeof dados.novaSenha === "string" &&
    typeof dados.confirmarSenha === "string"
  );
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isAlterarSenhaBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    if (body.novaSenha !== body.confirmarSenha) {
      return NextResponse.json({ error: "As senhas não coincidem" }, { status: 400 });
    }

    const erroSenha = validarNovaSenha(body.novaSenha);
    if (erroSenha) {
      return NextResponse.json({ error: erroSenha }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { id: true, senha: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const confere = await senhaConfere(body.senhaAtual, usuario.senha);
    if (!confere) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: await hashSenha(body.novaSenha) },
    });

    return NextResponse.json({ ok: true, mensagem: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("[PATCH /api/auth/senha]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
