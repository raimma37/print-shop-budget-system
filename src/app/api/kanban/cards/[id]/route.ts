import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanCards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const cardId = parseInt(idParam);
    if (isNaN(cardId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const data = await request.json();
    
    const updateData: any = {};
    if (data.columnId !== undefined) updateData.columnId = data.columnId;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isDone !== undefined) updateData.isDone = data.isDone;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.clientId !== undefined) updateData.clientId = data.clientId ? parseInt(data.clientId) : null;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nenhum dado para atualizar." }, { status: 400 });
    }

    const [updatedCard] = await db
      .update(kanbanCards)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(kanbanCards.id, cardId))
      .returning();

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error: any) {
    console.error("Erro ao atualizar cartão:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
