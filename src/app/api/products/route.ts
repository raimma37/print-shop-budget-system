import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const category = req.nextUrl.searchParams.get("category") ?? "";

    let query = db.select().from(products).where(eq(products.active, true)).orderBy(desc(products.createdAt)).$dynamic();

    if (search) {
      query = query.where(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.category, `%${search}%`)
        )
      );
    }

    if (category) {
      query = query.where(eq(products.category, category));
    }

    const rows = await query;
    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const [product] = await db.insert(products).values({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      category: body.category?.trim() || null,
      unit: body.unit?.trim() || "un",
      basePrice: String(body.basePrice ?? "0"),
    }).returning();

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
