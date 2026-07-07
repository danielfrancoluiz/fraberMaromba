import { getNextAuthUrl } from "@/lib/nextauth-config";

interface EnviarEmailRedefinicaoParams {
  email: string;
  nome: string;
  token: string;
}

export async function enviarEmailRedefinicaoSenha({
  email,
  nome,
  token,
}: EnviarEmailRedefinicaoParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? "Fraber <noreply@fraber.com>";

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY não configurada — link de redefinição:",
      `${getNextAuthUrl()}/redefinir-senha?token=${token}`
    );
    return false;
  }

  const link = `${getNextAuthUrl()}/redefinir-senha?token=${encodeURIComponent(token)}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Redefinir senha — Fraber CrossFit",
      html: `
        <p>Olá, ${nome}!</p>
        <p>Recebemos um pedido para redefinir sua senha no Fraber CrossFit.</p>
        <p><a href="${link}">Clique aqui para criar uma nova senha</a></p>
        <p>O link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
      `,
    }),
  });

  if (!res.ok) {
    console.error("[email] falha ao enviar:", await res.text());
    return false;
  }

  return true;
}
