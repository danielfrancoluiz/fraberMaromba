import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyNextAuthEnv } from "@/lib/nextauth-config";

applyNextAuthEnv();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
