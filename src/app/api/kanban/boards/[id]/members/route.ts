import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanBoardMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const boardId = parseInt(idParam);
    if (isNaN(boardId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const members = await db
      .select({
        id: kanbanBoardMembers.id,
        boardId: kanbanBoardMembers.boardId,
        userId: kanbanBoardMembers.userId,
        role: kanbanBoardMembers.role,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatarInitials,
      })
      .from(kanbanBoardMembers)
      .innerJoin(users, eq(kanbanBoardMembers.userId, users.id))
      .where(eq(kanbanBoardMembers.boardId, boardId));

    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error("Erro ao buscar membros:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const boardId = parseInt(idParam);
    if (isNaN(boardId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const data = await request.json();
    if (!data.userId) return NextResponse.json({ error: "User ID é obrigatório." }, { status: 400 });

    // Check if already exists
    const existing = await db.select().from(kanbanBoardMembers)
      .where(and(eq(kanbanBoardMembers.boardId, boardId), eq(kanbanBoardMembers.userId, data.userId)));
      
    if (existing.length > 0) {
      return NextResponse.json({ error: "Usuário já é membro deste quadro." }, { status: 400 });
    }

    const [newMember] = await db
      .insert(kanbanBoardMembers)
      .values({
        boardId,
        userId: data.userId,
        role: data.role || "member",
      })
      .returning();

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    console.error("Erro ao adicionar membro:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const boardId = parseInt(idParam);
    if (isNaN(boardId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const data = await request.json();
    if (!data.userId) return NextResponse.json({ error: "User ID é obrigatório." }, { status: 400 });

    await db
      .delete(kanbanBoardMembers)
      .where(and(eq(kanbanBoardMembers.boardId, boardId), eq(kanbanBoardMembers.userId, data.userId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
