import { NextResponse } from "next/server";
import { getDiasAvisoVencimento } from "@/lib/plano-vencimento";

export async function GET() {
  try {
    const diasAvisoVencimento = await getDiasAvisoVencimento();
    return NextResponse.json({ diasAvisoVencimento });
  } catch (error) {
    console.error("[config]", error);
    return NextResponse.json({ diasAvisoVencimento: 5 });
  }
}
