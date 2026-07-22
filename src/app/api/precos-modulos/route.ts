import { NextResponse } from "next/server";
import { listarPrecosModulos } from "@/lib/precos-modulos-server";

export async function GET() {
  try {
    const precos = await listarPrecosModulos();
    return NextResponse.json(
      precos.map((p) => ({
        quantidade: p.quantidade,
        valorCentavos: p.valorCentavos,
        diasValidade: p.diasValidade,
      }))
    );
  } catch (error) {
    console.error("[precos-modulos]", error);
    return NextResponse.json(
      [
        { quantidade: 1, valorCentavos: 1990, diasValidade: 30 },
        { quantidade: 2, valorCentavos: 2990, diasValidade: 30 },
        { quantidade: 3, valorCentavos: 3990, diasValidade: 30 },
      ],
      { status: 200 }
    );
  }
}
