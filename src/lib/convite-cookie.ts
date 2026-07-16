import { CONVITE_COOKIE } from "@/lib/convite-cookie-name";

/** Define cookie de convite antes do OAuth Google (client-side). */
export function setConviteCookie(token: string): void {
  const valor = encodeURIComponent(token.trim());
  document.cookie = `${CONVITE_COOKIE}=${valor}; Path=/; Max-Age=600; SameSite=Lax`;
}

export function clearConviteCookie(): void {
  document.cookie = `${CONVITE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
