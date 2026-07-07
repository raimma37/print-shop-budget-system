import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orcamentos, orcamentoItems, clients, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const numId = parseInt(id);

    const [orc] = await db
      .select({
        id: orcamentos.id,
        numero: orcamentos.numero,
        status: orcamentos.status,
        validUntil: orcamentos.validUntil,
        subtotal: orcamentos.subtotal,
        discount: orcamentos.discount,
        total: orcamentos.total,
        notes: orcamentos.notes,
        internalNotes: orcamentos.internalNotes,
        createdAt: orcamentos.createdAt,
        updatedAt: orcamentos.updatedAt,
        clientId: orcamentos.clientId,
        userId: orcamentos.userId,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        clientCnpjCpf: clients.cnpjCpf,
        clientAddress: clients.address,
        clientCity: clients.city,
        clientState: clients.state,
        userName: users.name,
        userEmail: users.email,
      })
      .from(orcamentos)
      .innerJoin(clients, eq(orcamentos.clientId, clients.id))
      .innerJoin(users, eq(orcamentos.userId, users.id))
      .where(eq(orcamentos.id, numId))
      .limit(1);

    if (!orc) return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });

    const items = await db
      .select()
      .from(orcamentoItems)
      .where(eq(orcamentoItems.orcamentoId, numId))
      .orderBy(orcamentoItems.sortOrder);

    return NextResponse.json({ ...orc, items });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const numId = parseInt(id);
    const body = await req.json();

    const items: Array<{
      productId?: number | null;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      discount: number;
      sortOrder: number;
    }> = body.items ?? [];

    let subtotal = 0;
    for (const item of items) {
      const qty = parseFloat(String(item.quantity)) || 0;
      const price = parseFloat(String(item.unitPrice)) || 0;
      const disc = parseFloat(String(item.discount)) || 0;
      const itemTotal = qty * price * (1 - disc / 100);
      subtotal += itemTotal;
    }

    const discountAmt = parseFloat(String(body.discount)) || 0;
    const total = subtotal - discountAmt;

    const [updated] = await db
      .update(orcamentos)
      .set({
        clientId: body.clientId,
        status: body.status,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        subtotal: String(subtotal.toFixed(2)),
        discount: String(discountAmt.toFixed(2)),
        total: String(total.toFixed(2)),
        notes: body.notes?.trim() || null,
        internalNotes: body.internalNotes?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(orcamentos.id, numId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });

    // Replace items
    await db.delete(orcamentoItems).where(eq(orcamentoItems.orcamentoId, numId));

    if (items.length > 0) {
      await db.insert(orcamentoItems).values(
        items.map((item, idx) => {
          const qty = parseFloat(String(item.quantity)) || 0;
          const price = parseFloat(String(item.unitPrice)) || 0;
          const disc = parseFloat(String(item.discount)) || 0;
          const itemTotal = qty * price * (1 - disc / 100);
          return {
            orcamentoId: numId,
            productId: item.productId ?? null,
            description: item.description,
            quantity: String(qty),
            unit: item.unit ?? "un",
            unitPrice: String(price.toFixed(2)),
            discount: String(disc.toFixed(2)),
            total: String(itemTotal.toFixed(2)),
            sortOrder: item.sortOrder ?? idx,
          };
        })
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const numId = parseInt(id);
    await db.delete(orcamentoItems).where(eq(orcamentoItems.orcamentoId, numId));
    await db.delete(orcamentos).where(eq(orcamentos.id, numId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
