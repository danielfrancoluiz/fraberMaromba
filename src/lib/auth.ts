import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { autenticarUsuario } from "@/lib/autenticar-usuario";
import { garantirUsuarioGoogle } from "@/lib/criar-usuario-google";
import { CONVITE_COOKIE } from "@/lib/convite-cookie-name";
import { GOOGLE_ROLE_COOKIE } from "@/lib/google-role-cookie-name";
import { applyNextAuthEnv, getNextAuthSecret } from "@/lib/nextauth-config";
import { prisma } from "@/lib/prisma";
import { carregarDadosSessaoPorEmail, carregarDadosSessaoPorId } from "@/lib/sessao-usuario";
import { cookies } from "next/headers";

applyNextAuthEnv();

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
export const googleConfigurado = Boolean(
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
            alunoId: usuario.alunoId,
            planoId: usuario.planoId,
            planoVenceEm: usuario.planoVenceEm,
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
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const existente = await carregarDadosSessaoPorEmail(user.email);
      if (existente) return true;

      const cookieStore = await cookies();
      const tokenConvite = cookieStore.get(CONVITE_COOKIE)?.value?.trim();
      const roleIntent = cookieStore.get(GOOGLE_ROLE_COOKIE)?.value?.trim();
      const querAluno = roleIntent === "aluno" || Boolean(tokenConvite);

      if (querAluno && !tokenConvite) {
        return "/cadastro?erro=convite";
      }

      if (querAluno && tokenConvite) {
        const convite = await prisma.convite.findUnique({
          where: { token: tokenConvite },
        });
        if (!convite || convite.usado) {
          return "/cadastro?erro=convite-invalido";
        }
        if (
          convite.email &&
          convite.email.trim().toLowerCase() !== user.email.trim().toLowerCase()
        ) {
          return "/cadastro?erro=convite-invalido";
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          try {
            const dados = await garantirUsuarioGoogle({
              nome: user.name ?? user.email,
              email: user.email,
            });
            token.id = dados.id;
            token.role = dados.role;
            token.status = dados.status;
            token.professorId = dados.professorId;
            token.alunoId = dados.alunoId;
            token.planoId = dados.planoId;
            token.planoVenceEm = dados.planoVenceEm;
            token.lastDbSync = Date.now();
          } catch (error) {
            console.error("[auth] falha no cadastro/login Google:", error);
          }
        } else {
          token.id = user.id;
          token.role = user.role;
          token.status = user.status;
          token.professorId = user.professorId;
          token.alunoId = user.alunoId;
          token.planoId = user.planoId;
          token.planoVenceEm = user.planoVenceEm;
          token.lastDbSync = Date.now();
        }
        return token;
      }

      // Atualiza plano/status do banco periodicamente (após pagamento sem novo login).
      const lastSync =
        typeof token.lastDbSync === "number" ? token.lastDbSync : 0;
      if (token.id && Date.now() - lastSync > 30_000) {
        try {
          const dados = await carregarDadosSessaoPorId(token.id as string);
          if (dados) {
            token.role = dados.role;
            token.status = dados.status;
            token.professorId = dados.professorId;
            token.alunoId = dados.alunoId;
            token.planoId = dados.planoId;
            token.planoVenceEm = dados.planoVenceEm;
          }
          token.lastDbSync = Date.now();
        } catch (error) {
          console.error("[auth] falha ao sincronizar sessão:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "professor" | "aluno";
        session.user.status = token.status as
          | "ativo_professor"
          | "ativo_plataforma"
          | "inativo";
        session.user.professorId = token.professorId as string | undefined;
        session.user.alunoId = token.alunoId as string | undefined;
        session.user.planoId = token.planoId as string | undefined;
        session.user.planoVenceEm = token.planoVenceEm as string | undefined;
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
