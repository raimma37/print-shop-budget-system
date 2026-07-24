import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanBoards, kanbanColumns, kanbanCards } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const boardId = parseInt(idParam);
    if (isNaN(boardId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const [board] = await db.select().from(kanbanBoards).where(eq(kanbanBoards.id, boardId));
    
    if (!board) {
      return NextResponse.json({ error: "Quadro não encontrado." }, { status: 404 });
    }

    // Buscar colunas
    const columns = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.boardId, boardId))
      .orderBy(asc(kanbanColumns.position));

    // Buscar cartões para as colunas deste quadro
    const columnIds = columns.map(c => c.id);
    let cards: any[] = [];
    
    if (columnIds.length > 0) {
      // Drizzle 'inArray' não suporta arrays vazios, então verificamos
      const { inArray } = await import("drizzle-orm");
      cards = await db
        .select()
        .from(kanbanCards)
        .where(inArray(kanbanCards.columnId, columnIds))
        .orderBy(asc(kanbanCards.position));
    }

    // Formatar como esperado pelo frontend
    const formattedColumns = columns.map(col => ({
      ...col,
      cards: cards.filter(card => card.columnId === col.id).map(card => ({
        ...card,
        tags: typeof card.tags === 'string' ? JSON.parse(card.tags || "[]") : card.tags,
        members: typeof card.members === 'string' ? JSON.parse(card.members || "[]") : card.members,
        comments: 0,
        attachments: 0
      }))
    }));

    return NextResponse.json({ board, columns: formattedColumns });
  } catch (error: any) {
    console.error("Erro ao carregar quadro:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
