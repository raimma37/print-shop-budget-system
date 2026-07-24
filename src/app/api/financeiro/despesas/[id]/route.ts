import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const amount = parseFloat(String(body.amount ?? "0"));
    const isPaying = body.status === "pago";

    const [updated] = await db
      .update(expenses)
      .set({
        description: body.description?.trim(),
        category: body.category?.trim() || "outros",
        amount: String(isNaN(amount) ? 0 : amount.toFixed(2)),
        dueDate: body.dueDate,
        status: body.status,
        paidAt: isPaying ? (body.paidAt || new Date().toISOString().slice(0, 10)) : null,
        recurring: Boolean(body.recurring),
        recurringInterval: body.recurringInterval || null,
        notes: body.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/financeiro/despesas/[id]]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(expenses).where(eq(expenses.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/financeiro/despesas/[id]]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
