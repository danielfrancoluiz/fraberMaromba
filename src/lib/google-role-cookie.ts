import {
  GOOGLE_ROLE_COOKIE,
  type GoogleRoleIntent,
} from "@/lib/google-role-cookie-name";
import { clearConviteCookie, setConviteCookie } from "@/lib/convite-cookie";

export type { GoogleRoleIntent };

export function setGoogleRoleCookie(role: GoogleRoleIntent): void {
  document.cookie = `${GOOGLE_ROLE_COOKIE}=${role}; Path=/; Max-Age=600; SameSite=Lax`;
}

export function clearGoogleRoleCookie(): void {
  document.cookie = `${GOOGLE_ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Prepara cookies antes do signIn Google. */
export function prepareGoogleSignIn(options: {
  role: GoogleRoleIntent;
  tokenConvite?: string;
}): void {
  setGoogleRoleCookie(options.role);

  if (options.role === "aluno" && options.tokenConvite) {
    setConviteCookie(options.tokenConvite);
  } else {
    clearConviteCookie();
  }
}
