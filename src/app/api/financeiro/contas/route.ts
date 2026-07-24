import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, clientAccounts, financialTransactions } from "@/db/schema";
import { eq, sum, sql, desc } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    // Lista todos os clientes com saldo calculado
    const allClients = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        active: clients.active,
      })
      .from(clients)
      .where(eq(clients.active, true))
      .orderBy(clients.name);

    // Saldo por cliente (soma de todas as transações)
    const balances = await db
      .select({
        clientId: financialTransactions.clientId,
        balance: sum(financialTransactions.amount),
      })
      .from(financialTransactions)
      .groupBy(financialTransactions.clientId);

    const balanceMap: Record<number, number> = {};
    for (const b of balances) {
      balanceMap[b.clientId] = parseFloat(b.balance ?? "0");
    }

    // Configurações de conta
    const accounts = await db.select().from(clientAccounts);
    const accountMap: Record<number, typeof accounts[0]> = {};
    for (const a of accounts) accountMap[a.clientId] = a;

    const result = allClients.map((c) => ({
      ...c,
      balance: balanceMap[c.id] ?? 0,
      creditLimit: parseFloat(accountMap[c.id]?.creditLimit ?? "0"),
      blocked: accountMap[c.id]?.blocked ?? false,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/financeiro/contas]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
