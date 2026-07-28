"use client";

/**
 * Após pagamento Stripe: confirma no backend, sincroniza JWT e navega
 * para o início do módulo contratado (reload completo — cookie JWT atualizado).
 */

export type SessaoUpdateFn = (data?: Record<string, unknown>) => Promise<unknown>;

type ConfirmarBody = {
  confirmado?: boolean;
  modulosAtivos?: string[];
  modulosVencimentos?: Record<string, string>;
  planoVenceEm?: string | null;
  planoId?: string | null;
  status?: string;
  destino?: string;
  error?: string;
};

function temModulos(body: ConfirmarBody): boolean {
  if (Array.isArray(body.modulosAtivos) && body.modulosAtivos.length > 0) {
    return true;
  }
  if (
    body.modulosVencimentos &&
    typeof body.modulosVencimentos === "object" &&
    Object.keys(body.modulosVencimentos).length > 0
  ) {
    return true;
  }
  return false;
}

async function confirmarComRetry(
  paymentIntentId: string
): Promise<ConfirmarBody> {
  let ultimo: ConfirmarBody = {};

  for (let tentativa = 0; tentativa < 4; tentativa++) {
    if (tentativa > 0) {
      await new Promise((r) => setTimeout(r, 600 * tentativa));
    }

    try {
      const res = await fetch("/api/pagamentos/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentIntentId }),
      });
      ultimo = (await res.json().catch(() => ({}))) as ConfirmarBody;
      if (res.ok && temModulos(ultimo)) return ultimo;
      if (res.ok && ultimo.destino) return ultimo;
    } catch {
      /* tenta de novo */
    }
  }

  // Fallback: estado atual no banco (webhook pode ter liberado).
  try {
    const res = await fetch("/api/aluno/acesso", { credentials: "include" });
    if (res.ok) {
      const acesso = (await res.json()) as ConfirmarBody;
      if (temModulos(acesso)) {
        return {
          ...acesso,
          destino: ultimo.destino ?? acesso.destino,
        };
      }
    }
  } catch {
    /* ignora */
  }

  return ultimo;
}

export async function finalizarPosPagamentoAluno(params: {
  paymentIntentId: string;
  update: SessaoUpdateFn;
  /** Se false, só sincroniza (sem navegar). Default true. */
  navegar?: boolean;
}): Promise<string> {
  const body = await confirmarComRetry(params.paymentIntentId);

  if (temModulos(body)) {
    await params.update({
      modulosAtivos: body.modulosAtivos,
      modulosVencimentos: body.modulosVencimentos,
      planoVenceEm: body.planoVenceEm,
      planoId: body.planoId,
      status: body.status ?? "ativo_plataforma",
    });
  } else {
    await params.update({ syncFromDb: true });
  }

  const destino =
    body.destino && body.destino.startsWith("/aluno/")
      ? body.destino
      : "/aluno/dashboard";

  if (params.navegar !== false) {
    window.location.assign(destino);
  }

  return destino;
}
