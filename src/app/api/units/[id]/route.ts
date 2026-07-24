import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productUnits } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da unidade é obrigatório." }, { status: 400 });
    }
    if (!body.abbreviation?.trim()) {
      return NextResponse.json({ error: "Abreviação é obrigatória." }, { status: 400 });
    }

    const [updated] = await db
      .update(productUnits)
      .set({
        name: body.name.trim(),
        abbreviation: body.abbreviation.trim(),
        active: body.active !== false,
      })
      .where(eq(productUnits.id, Number(id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Unidade não encontrada." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/units/[id]] Error:", err);
    return NextResponse.json({ error: "Erro ao atualizar unidade." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(productUnits).where(eq(productUnits.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/units/[id]] Error:", err);
    return NextResponse.json({ error: "Erro ao excluir unidade." }, { status: 500 });
  }
}
