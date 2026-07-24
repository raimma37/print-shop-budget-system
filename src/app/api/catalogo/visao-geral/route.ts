import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      module: "catalogo/visao-geral",
      status: "online",
      version: "1.0.0",
      capabilities: ["read", "write"]
    },
    {
      headers: {
        "X-Catalogo-Module": "visao-geral",
      }
    }
  );
}

export async function POST(request: Request) {
  return NextResponse.json(
    { error: "Método não implementado para este endpoint base" },
    { status: 501 }
  );
}
