import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verificarSenha } from "@/lib/senha";

function isRole(value: string): value is "professor" | "aluno" {
  return value === "professor" || value === "aluno";
}

function isStatus(
  value: string
): value is "ativo_professor" | "ativo_plataforma" | "inativo" {
  return (
    value === "ativo_professor" ||
    value === "ativo_plataforma" ||
    value === "inativo"
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const email = credentials.email.trim().toLowerCase();

        try {
          const usuario = await prisma.usuario.findUnique({
            where: { email },
          });

          if (!usuario) {
            console.warn("[auth] usuário não encontrado:", email);
            return null;
          }

          const senhaCorreta = await verificarSenha(
            credentials.senha,
            usuario.senha
          );

          if (!senhaCorreta) {
            console.warn("[auth] senha incorreta:", email);
            return null;
          }

          if (!isRole(usuario.role) || !isStatus(usuario.status)) {
            console.warn("[auth] role/status inválido:", email, usuario.role, usuario.status);
            return null;
          }

          let professorId: string | undefined;

          if (usuario.role === "aluno") {
            const aluno = await prisma.aluno.findFirst({
              where: {
                OR: [{ usuarioId: usuario.id }, { id: usuario.id }],
              },
            });
            professorId = aluno?.professorId;
          }

          return {
            id: usuario.id,
            name: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            status: usuario.status,
            professorId,
          };
        } catch (error) {
          console.error("[auth] falha ao consultar banco:", error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.professorId = user.professorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.professorId = token.professorId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
