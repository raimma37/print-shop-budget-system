import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialTransactions, clients, users } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { logAudit } from "@/lib/financeiro";

const DEFAULT_USER_ID = 1;

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const clientId = sp.get("clientId") ? parseInt(sp.get("clientId")!) : null;
    const type = sp.get("type") ?? "";
    const from = sp.get("from") ? new Date(sp.get("from")!) : null;
    const to = sp.get("to") ? new Date(sp.get("to")!) : null;

    const conditions = [];
    if (clientId) conditions.push(eq(financialTransactions.clientId, clientId));
    if (type) conditions.push(eq(financialTransactions.type, type as "charge" | "payment" | "adjustment" | "interest" | "discount"));
    if (from) conditions.push(gte(financialTransactions.createdAt, from));
    if (to) conditions.push(lte(financialTransactions.createdAt, to));

    const rows = await db
      .select({
        id: financialTransactions.id,
        clientId: financialTransactions.clientId,
        clientName: clients.name,
        type: financialTransactions.type,
        category: financialTransactions.category,
        description: financialTransactions.description,
        amount: financialTransactions.amount,
        paymentMethod: financialTransactions.paymentMethod,
        dueDate: financialTransactions.dueDate,
        paidAt: financialTransactions.paidAt,
        createdAt: financialTransactions.createdAt,
        createdByName: users.name,
      })
      .from(financialTransactions)
      .innerJoin(clients, eq(financialTransactions.clientId, clients.id))
      .innerJoin(users, eq(financialTransactions.createdBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(financialTransactions.createdAt))
      .limit(200);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/financeiro/transacoes]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.clientId) return NextResponse.json({ error: "Cliente é obrigatório." }, { status: 400 });
    if (!body.description?.trim()) return NextResponse.json({ error: "Descrição é obrigatória." }, { status: 400 });
    if (!body.type) return NextResponse.json({ error: "Tipo é obrigatório." }, { status: 400 });

    const amount = parseFloat(String(body.amount ?? "0"));
    if (isNaN(amount) || amount === 0) return NextResponse.json({ error: "Valor inválido." }, { status: 400 });

    // Pagamentos e descontos devem ter amount negativo
    let finalAmount = amount;
    if (["payment", "discount"].includes(body.type) && amount > 0) {
      finalAmount = -amount;
    }
    if (["charge", "interest"].includes(body.type) && amount < 0) {
      finalAmount = Math.abs(amount);
    }

    const [tx] = await db
      .insert(financialTransactions)
      .values({
        clientId: parseInt(body.clientId),
        type: body.type,
        category: body.category?.trim() || "outros",
        description: body.description.trim(),
        amount: String(finalAmount.toFixed(2)),
        paymentMethod: body.paymentMethod || null,
        invoiceId: body.invoiceId ? parseInt(body.invoiceId) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        paidAt: body.type === "payment" ? new Date() : null,
        createdBy: DEFAULT_USER_ID,
      })
      .returning();

    await logAudit(
      `${body.type}_created`,
      "transaction",
      tx.id,
      { clientId: body.clientId, amount: finalAmount, description: body.description }
    );

    return NextResponse.json(tx, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financeiro/transacoes]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
