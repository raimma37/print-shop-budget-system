import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastSync = searchParams.get("lastSync"); // Para futura Fase 3 (Delta sync)

    const activeProducts = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.active, true),
      with: { packagings: true },
    });
    const activeClients = await db.select().from(clients).where(eq(clients.active, true));

    return NextResponse.json({
      products: activeProducts,
      clients: activeClients,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao buscar catálogo do PDV:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
