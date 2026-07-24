import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanCards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.columnId || !data.title) {
      return NextResponse.json({ error: "columnId e title são obrigatórios." }, { status: 400 });
    }

    // Achar a maior posição atual para colocar o novo cartão no final
    const existingCards = await db.select().from(kanbanCards).where(eq(kanbanCards.columnId, data.columnId));
    const maxPosition = existingCards.length > 0 ? Math.max(...existingCards.map(c => c.position)) : -1;

    const [newCard] = await db.insert(kanbanCards).values({
      columnId: data.columnId,
      title: data.title,
      description: data.description || "",
      priority: data.priority || "medium",
      position: maxPosition + 1,
      tags: JSON.stringify(data.tags || []),
      members: JSON.stringify(data.members || []),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      clientId: data.clientId ? parseInt(data.clientId) : null,
      fileUrl: data.fileUrl || null
    }).returning();

    // Formatar arrays do DB que vêm como string
    const formattedCard = {
      ...newCard,
      tags: typeof newCard.tags === 'string' ? JSON.parse(newCard.tags) : newCard.tags,
      members: typeof newCard.members === 'string' ? JSON.parse(newCard.members) : newCard.members,
      comments: 0,
      attachments: 0
    };

    return NextResponse.json({ success: true, card: formattedCard });
  } catch (error: any) {
    console.error("Erro ao criar cartão kanban:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
