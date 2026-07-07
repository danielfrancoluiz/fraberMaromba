import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mensagemErroBanco } from "@/lib/erro-banco";
import { enviarEmailRedefinicaoSenha } from "@/lib/enviar-email-redefinicao";

const RESPOSTA_GENERICA =
  "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const email =
      typeof body === "object" &&
      body !== null &&
      "email" in body &&
      typeof (body as { email?: string }).email === "string"
        ? (body as { email: string }).email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json({ error: "Informe o e-mail" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, nome: true, email: true },
    });

    if (usuario) {
      const token = crypto.randomUUID();
      const expiraEm = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.tokenRedefinirSenha.updateMany({
        where: { usuarioId: usuario.id, usado: false },
        data: { usado: true },
      });

      await prisma.tokenRedefinirSenha.create({
        data: {
          usuarioId: usuario.id,
          token,
          expiraEm,
        },
      });

      await enviarEmailRedefinicaoSenha({
        email: usuario.email,
        nome: usuario.nome,
        token,
      });
    }

    return NextResponse.json({ ok: true, mensagem: RESPOSTA_GENERICA });
  } catch (error) {
    console.error("[POST /api/auth/esqueci-senha]", error);
    return NextResponse.json(
      { error: mensagemErroBanco(error) },
      { status: 500 }
    );
  }
}
