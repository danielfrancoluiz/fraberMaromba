import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export interface ApiSessionUser {
  id: string;
  role: "professor" | "aluno";
  status: "ativo_professor" | "ativo_plataforma" | "inativo";
  professorId?: string;
}

export interface ApiSession {
  user: ApiSessionUser;
}

function mapTokenToSession(token: Record<string, unknown>): ApiSession | null {
  const { id, role, status, professorId } = token;

  if (typeof id !== "string") return null;
  if (role !== "professor" && role !== "aluno") return null;
  if (
    status !== "ativo_professor" &&
    status !== "ativo_plataforma" &&
    status !== "inativo"
  ) {
    return null;
  }

  return {
    user: {
      id,
      role,
      status,
      professorId: typeof professorId === "string" ? professorId : undefined,
    },
  };
}

async function readToken(req?: NextRequest): Promise<Record<string, unknown> | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  if (req) {
    const token = await getToken({ req, secret });
    return token ? (token as Record<string, unknown>) : null;
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const token = await getToken({
    req: { headers: { cookie: cookieHeader } } as unknown as NextRequest,
    secret,
  });

  return token ? (token as Record<string, unknown>) : null;
}

export async function getApiSession(req?: NextRequest): Promise<ApiSession | null> {
  const token = await readToken(req);
  if (!token) return null;
  return mapTokenToSession(token);
}

export async function requireProfessorSession(
  req?: NextRequest
): Promise<ApiSession | null> {
  const session = await getApiSession(req);
  if (!session || session.user.role !== "professor") return null;
  return session;
}

export async function requireAlunoSession(
  req?: NextRequest
): Promise<ApiSession | null> {
  const session = await getApiSession(req);
  if (!session || session.user.role !== "aluno") return null;
  return session;
}
