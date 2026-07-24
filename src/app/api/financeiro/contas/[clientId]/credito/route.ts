import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clientAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const cid = parseInt(clientId);
    const body = await req.json();

    const creditLimit = parseFloat(String(body.creditLimit ?? "0")) || 0;
    const blocked = Boolean(body.blocked);
    const notes = body.notes?.trim() || null;

    // Upsert
    const existing = await db
      .select({ id: clientAccounts.id })
      .from(clientAccounts)
      .where(eq(clientAccounts.clientId, cid))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(clientAccounts)
        .set({ creditLimit: String(creditLimit.toFixed(2)), blocked, notes, updatedAt: new Date() })
        .where(eq(clientAccounts.clientId, cid));
    } else {
      await db.insert(clientAccounts).values({
        clientId: cid,
        creditLimit: String(creditLimit.toFixed(2)),
        blocked,
        notes,
      });
    }

    return NextResponse.json({ ok: true, creditLimit, blocked });
  } catch (err) {
    console.error("[PUT /api/financeiro/contas/[clientId]/credito]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
