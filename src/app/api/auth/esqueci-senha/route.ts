import { NextRequest, NextResponse } from "next/server";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { normalizarEmail } from "@/lib/email";
import { redefinirSenhaPorEmail } from "@/lib/redefinir-senha-conta";
import { hashSenha, validarNovaSenha } from "@/lib/senha";

interface EsqueciSenhaBody {
  email: string;
  novaSenha: string;
  confirmarSenha: string;
}

function isEsqueciSenhaBody(value: unknown): value is EsqueciSenhaBody {
  if (typeof value !== "object" || value === null) return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.email === "string" &&
    typeof dados.novaSenha === "string" &&
    typeof dados.confirmarSenha === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!isEsqueciSenhaBody(body)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const email = normalizarEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: "Informe o e-mail" }, { status: 400 });
    }

    if (body.novaSenha !== body.confirmarSenha) {
      return NextResponse.json({ error: "As senhas não coincidem" }, { status: 400 });
    }

    const erroSenha = validarNovaSenha(body.novaSenha);
    if (erroSenha) {
      return NextResponse.json({ error: erroSenha }, { status: 400 });
    }

    const resultado = await redefinirSenhaPorEmail(email, await hashSenha(body.novaSenha));

    if (resultado === "nao_encontrado") {
      return NextResponse.json({ error: "E-mail não cadastrado" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      mensagem: "Senha redefinida com sucesso! Faça login com a nova senha.",
    });
  } catch (error) {
    console.error("[POST /api/auth/esqueci-senha]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
