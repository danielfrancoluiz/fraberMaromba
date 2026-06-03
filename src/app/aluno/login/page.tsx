import { redirect } from "next/navigation";

/** Legado: redireciona para login unificado */
export default function Page() {
  redirect("/login");
}
