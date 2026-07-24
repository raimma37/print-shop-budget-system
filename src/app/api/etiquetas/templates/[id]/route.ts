import { NextResponse } from "next/server";
import { db } from "@/db";
import { labelTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const body = await request.json();
    const { name, width, height, type, tags, zplCode, htmlCode } = body;

    const [updatedTemplate] = await db
      .update(labelTemplates)
      .set({
        name,
        width: width ? width.toString() : undefined,
        height: height ? height.toString() : undefined,
        type,
        tags: tags ? JSON.stringify(tags) : undefined,
        zplCode: zplCode !== undefined ? zplCode : undefined,
        htmlCode: htmlCode !== undefined ? htmlCode : undefined,
        updatedAt: new Date(),
      })
      .where(eq(labelTemplates.id, id))
      .returning();

    return NextResponse.json(updatedTemplate);
  } catch (error: any) {
    console.error("Erro ao atualizar template:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    await db.delete(labelTemplates).where(eq(labelTemplates.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar template:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
