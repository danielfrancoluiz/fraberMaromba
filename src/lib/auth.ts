import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { autenticarUsuario } from "@/lib/autenticar-usuario";
import { applyNextAuthEnv, getNextAuthSecret } from "@/lib/nextauth-config";

applyNextAuthEnv();

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleConfigurado = Boolean(
  googleClientId &&
    googleClientSecret &&
    googleClientId !== "placeholder_configure_later"
);

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

        try {
          const usuario = await autenticarUsuario(
            credentials.email,
            credentials.senha
          );
          if (!usuario) return null;

          return {
            id: usuario.id,
            name: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            status: usuario.status,
            professorId: usuario.professorId,
          };
        } catch (error) {
          console.error("[auth] falha ao consultar banco:", error);
          throw error;
        }
      },
    }),
    ...(googleConfigurado
      ? [
          GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          }),
        ]
      : []),
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
  secret: getNextAuthSecret(),
};
