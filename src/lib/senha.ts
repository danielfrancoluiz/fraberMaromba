import bcrypt from "bcryptjs";

export function isBcryptHash(valor: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(valor);
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function verificarSenha(
  senha: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function senhaConfere(
  senhaInformada: string,
  senhaArmazenada: string
): Promise<boolean> {
  if (isBcryptHash(senhaArmazenada)) {
    return verificarSenha(senhaInformada, senhaArmazenada);
  }
  return senhaInformada === senhaArmazenada;
}

export function validarNovaSenha(senha: string): string | null {
  if (!senha) return "Informe a nova senha";
  if (senha.length < 6) return "A senha deve ter no mínimo 6 caracteres";
  return null;
}
