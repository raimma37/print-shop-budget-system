import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanColumns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const columns = await db.select().from(kanbanColumns);
    return NextResponse.json(columns);
  } catch (error: any) {
    console.error("Erro ao listar colunas:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.boardId || !data.title) {
      return NextResponse.json({ error: "boardId e title são obrigatórios." }, { status: 400 });
    }

    // Achar a maior posição atual para colocar a nova coluna no final
    const existingCols = await db.select().from(kanbanColumns).where(eq(kanbanColumns.boardId, data.boardId));
    const maxPosition = existingCols.length > 0 ? Math.max(...existingCols.map(c => c.position)) : -1;

    const [newColumn] = await db.insert(kanbanColumns).values({
      boardId: data.boardId,
      title: data.title,
      position: maxPosition + 1,
      wipLimit: data.wipLimit || null
    }).returning();

    // Formatar como esperado
    return NextResponse.json({ 
      success: true, 
      column: { ...newColumn, cards: [] } 
    });
  } catch (error: any) {
    console.error("Erro ao criar coluna kanban:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
