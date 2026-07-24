import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [client] = await db.select().from(clients).where(eq(clients.id, parseInt(id))).limit(1);
    if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const [updated] = await db
      .update(clients)
      .set({
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        cnpjCpf: body.cnpjCpf?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        notes: body.notes?.trim() || null,
        active: body.active ?? true,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, parseInt(id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.update(clients).set({ active: false, updatedAt: new Date() }).where(eq(clients.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
