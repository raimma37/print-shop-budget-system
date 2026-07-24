import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanBoards, kanbanColumns, kanbanCards } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const boards = await db.select().from(kanbanBoards).orderBy(desc(kanbanBoards.updatedAt));
    
    // Obter o número de cards para cada board
    const boardsWithCount = await Promise.all(boards.map(async (board) => {
      const columns = await db.select({ id: kanbanColumns.id }).from(kanbanColumns).where(eq(kanbanColumns.boardId, board.id));
      const columnIds = columns.map(c => c.id);
      
      let activeTasks = 0;
      if (columnIds.length > 0) {
        const cards = await db.select({ id: kanbanCards.id }).from(kanbanCards).where(inArray(kanbanCards.columnId, columnIds));
        activeTasks = cards.length;
      }
      
      return {
        ...board,
        activeTasks
      };
    }));

    return NextResponse.json(boardsWithCount);
  } catch (error: any) {
    console.error("Erro ao listar quadros kanban:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const [newBoard] = await db.insert(kanbanBoards).values({
      name: data.name,
      description: data.description || "",
      category: data.category || "Geral",
      color: data.color || "bg-fuchsia-500",
      members: data.members || 1,
      visibility: data.visibility || "public",
    }).returning();

    return NextResponse.json({ success: true, board: newBoard });
  } catch (error: any) {
    console.error("Erro ao criar quadro kanban:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
