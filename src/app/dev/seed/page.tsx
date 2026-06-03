import { redirect } from "next/navigation";

/** Rota de desenvolvimento descontinuada (seed via Prisma CLI). */
export default function Page() {
  redirect("/login");
}
