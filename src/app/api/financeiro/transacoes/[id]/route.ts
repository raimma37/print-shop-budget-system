import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "@/lib/financeiro";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id);

    const [tx] = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.id, numId))
      .limit(1);

    if (!tx) return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });

    await db.delete(financialTransactions).where(eq(financialTransactions.id, numId));

    await logAudit("transaction_deleted", "transaction", numId, {
      clientId: tx.clientId,
      amount: tx.amount,
      description: tx.description,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/financeiro/transacoes/[id]]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
