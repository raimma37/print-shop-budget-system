import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      module: "catalogo/estrutura",
      status: "online",
      version: "1.0.0",
      capabilities: ["read", "write"]
    },
    {
      headers: {
        "X-Catalogo-Module": "estrutura",
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
