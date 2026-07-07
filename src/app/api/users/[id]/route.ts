import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, hashPassword } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const numId = parseInt(id);

    // Users can update themselves; only admins can update others
    if (session.role !== "admin" && session.userId !== numId) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {
      name: body.name?.trim(),
      email: body.email?.toLowerCase().trim(),
      role: body.role,
      active: body.active,
      avatarInitials: body.name ? getInitials(body.name.trim()) : undefined,
      updatedAt: new Date(),
    };

    if (body.password?.trim()) {
      updateData.passwordHash = await hashPassword(body.password);
    }

    // Remove undefined fields
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    );

    const [updated] = await db
      .update(users)
      .set(cleanData)
      .where(eq(users.id, numId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarInitials: users.avatarInitials,
        active: users.active,
        createdAt: users.createdAt,
      });

    if (!updated) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Apenas admins podem remover usuários." }, { status: 403 });
    }
    const { id } = await params;
    await db.update(users).set({ active: false, updatedAt: new Date() }).where(eq(users.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
