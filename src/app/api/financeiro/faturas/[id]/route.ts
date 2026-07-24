import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialInvoices, financialTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(financialInvoices)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(financialInvoices.id, parseInt(id)))
      .returning();

    // Se marcada como paga, liquidar todas as transações da fatura
    if (body.status === "paga") {
      await db
        .update(financialTransactions)
        .set({ paidAt: new Date() })
        .where(eq(financialTransactions.invoiceId, parseInt(id)));
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/financeiro/faturas/[id]]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
