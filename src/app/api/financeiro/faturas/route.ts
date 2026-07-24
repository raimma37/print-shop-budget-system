import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialInvoices, financialTransactions, clients } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { generateInvoiceNumber } from "@/lib/financeiro";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const clientId = sp.get("clientId") ? parseInt(sp.get("clientId")!) : null;
    const status = sp.get("status") ?? "";

    const conditions = [];
    if (clientId) conditions.push(eq(financialInvoices.clientId, clientId));
    if (status) conditions.push(eq(financialInvoices.status, status as "aberta" | "paga" | "vencida" | "cancelada"));

    const rows = await db
      .select({
        id: financialInvoices.id,
        numero: financialInvoices.numero,
        clientId: financialInvoices.clientId,
        clientName: clients.name,
        periodStart: financialInvoices.periodStart,
        periodEnd: financialInvoices.periodEnd,
        totalAmount: financialInvoices.totalAmount,
        status: financialInvoices.status,
        dueDate: financialInvoices.dueDate,
        createdAt: financialInvoices.createdAt,
      })
      .from(financialInvoices)
      .innerJoin(clients, eq(financialInvoices.clientId, clients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(financialInvoices.createdAt));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/financeiro/faturas]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.clientId) return NextResponse.json({ error: "Cliente é obrigatório." }, { status: 400 });

    // Busca transações não faturadas do período
    const txConditions = [
      eq(financialTransactions.clientId, parseInt(body.clientId)),
      eq(financialTransactions.type, "charge"),
      isNull(financialTransactions.invoiceId),
      isNull(financialTransactions.paidAt),
    ];

    const unbilled = await db
      .select()
      .from(financialTransactions)
      .where(and(...txConditions));

    if (unbilled.length === 0) {
      return NextResponse.json({ error: "Nenhuma cobrança pendente para faturar." }, { status: 422 });
    }

    const totalAmount = unbilled.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

    const [invoice] = await db
      .insert(financialInvoices)
      .values({
        numero: generateInvoiceNumber(),
        clientId: parseInt(body.clientId),
        periodStart: body.periodStart || null,
        periodEnd: body.periodEnd || null,
        totalAmount: String(totalAmount.toFixed(2)),
        status: "aberta",
        dueDate: body.dueDate || null,
        notes: body.notes?.trim() || null,
      })
      .returning();

    // Associa transações à fatura
    for (const tx of unbilled) {
      await db
        .update(financialTransactions)
        .set({ invoiceId: invoice.id })
        .where(eq(financialTransactions.id, tx.id));
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financeiro/faturas]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
