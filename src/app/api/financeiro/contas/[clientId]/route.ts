import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, clientAccounts, financialTransactions, financialInvoices, users } from "@/db/schema";
import { eq, sum, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const cid = parseInt(clientId);

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, cid))
      .limit(1);

    if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientId, cid))
      .limit(1);

    // Saldo atual
    const [balanceRow] = await db
      .select({ balance: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(eq(financialTransactions.clientId, cid));

    // Extrato completo
    const transactions = await db
      .select({
        id: financialTransactions.id,
        type: financialTransactions.type,
        category: financialTransactions.category,
        description: financialTransactions.description,
        amount: financialTransactions.amount,
        paymentMethod: financialTransactions.paymentMethod,
        invoiceId: financialTransactions.invoiceId,
        dueDate: financialTransactions.dueDate,
        paidAt: financialTransactions.paidAt,
        createdAt: financialTransactions.createdAt,
        createdByName: users.name,
      })
      .from(financialTransactions)
      .innerJoin(users, eq(financialTransactions.createdBy, users.id))
      .where(eq(financialTransactions.clientId, cid))
      .orderBy(desc(financialTransactions.createdAt));

    // Faturas
    const invoices = await db
      .select()
      .from(financialInvoices)
      .where(eq(financialInvoices.clientId, cid))
      .orderBy(desc(financialInvoices.createdAt));

    return NextResponse.json({
      client,
      account: account ?? { creditLimit: "0", blocked: false },
      balance: parseFloat(balanceRow.balance ?? "0"),
      transactions,
      invoices,
    });
  } catch (err) {
    console.error("[GET /api/financeiro/contas/[clientId]]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
