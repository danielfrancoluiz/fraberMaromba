/** Atualiza a sessão NextAuth sem travar a UI se o sync demorar. */
export async function atualizarSessaoComTimeout(
  update: () => Promise<unknown>,
  timeoutMs = 4000
): Promise<unknown> {
  try {
    return await Promise.race([
      update(),
      new Promise((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } catch {
    return null;
  }
}
