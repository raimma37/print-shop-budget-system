import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  { name: "Banners & Lonas", color: "#f97316", sortOrder: 0 },
  { name: "Adesivos & Vinil", color: "#8b5cf6", sortOrder: 1 },
  { name: "Placas & Painéis", color: "#0ea5e9", sortOrder: 2 },
  { name: "Letreiros & Fachadas", color: "#10b981", sortOrder: 3 },
  { name: "Totens & Displays", color: "#f59e0b", sortOrder: 4 },
  { name: "Papelaria", color: "#ec4899", sortOrder: 5 },
  { name: "Serviços", color: "#6366f1", sortOrder: 6 },
  { name: "Outros", color: "#64748b", sortOrder: 7 },
];

export async function GET() {
  try {
    let rows = await db
      .select()
      .from(productCategories)
      .orderBy(asc(productCategories.sortOrder), asc(productCategories.name));

    // Seed defaults se não houver nenhuma categoria
    if (rows.length === 0) {
      await db.insert(productCategories).values(DEFAULT_CATEGORIES);
      rows = await db
        .select()
        .from(productCategories)
        .orderBy(asc(productCategories.sortOrder), asc(productCategories.name));
    }

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/categories] Error:", err);
    return NextResponse.json({ error: "Erro ao buscar categorias." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da categoria é obrigatório." }, { status: 400 });
    }

    const count = await db.select().from(productCategories);
    const [created] = await db
      .insert(productCategories)
      .values({
        name: body.name.trim(),
        color: body.color?.trim() || "#64748b",
        sortOrder: count.length,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[POST /api/categories] Error:", err);
    return NextResponse.json({ error: "Erro ao criar categoria." }, { status: 500 });
  }
}
