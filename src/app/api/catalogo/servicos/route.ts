import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      module: "catalogo/servicos",
      status: "online",
      version: "1.0.0",
      capabilities: ["read", "write"]
    },
    {
      headers: {
        "X-Catalogo-Module": "servicos",
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
