import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da categoria é obrigatório." }, { status: 400 });
    }

    const [updated] = await db
      .update(productCategories)
      .set({
        name: body.name.trim(),
        color: body.color?.trim() || "#64748b",
        active: body.active !== false,
      })
      .where(eq(productCategories.id, Number(id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/categories/[id]] Error:", err);
    return NextResponse.json({ error: "Erro ao atualizar categoria." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(productCategories).where(eq(productCategories.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/categories/[id]] Error:", err);
    return NextResponse.json({ error: "Erro ao excluir categoria." }, { status: 500 });
  }
}
