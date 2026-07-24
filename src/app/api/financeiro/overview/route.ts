import { NextResponse } from "next/server";
import { db } from "@/db";
import { financialTransactions, expenses, clients } from "@/db/schema";
import { eq, lt, and, isNull, gte, sum, sql } from "drizzle-orm";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total a receber = soma de charges não pagas
    const [toReceive] = await db
      .select({ total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.type, "charge"),
          isNull(financialTransactions.paidAt)
        )
      );

    // Total a pagar (despesas pendentes)
    const [toPay] = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(eq(expenses.status, "pendente"));

    // Recebimentos do mês atual
    const [receivedThisMonth] = await db
      .select({ total: sum(sql<string>`ABS(${financialTransactions.amount})`) })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.type, "payment"),
          gte(financialTransactions.createdAt, firstOfMonth)
        )
      );

    // Inadimplência por faixa de atraso
    const overdueBuckets = await db
      .select({
        clientId: financialTransactions.clientId,
        amount: financialTransactions.amount,
        dueDate: financialTransactions.dueDate,
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.type, "charge"),
          isNull(financialTransactions.paidAt),
          lt(financialTransactions.dueDate, now)
        )
      );

    const inadimplencia = { ate30: 0, ate60: 0, ate90: 0, acima90: 0, total: 0 };
    for (const tx of overdueBuckets) {
      if (!tx.dueDate) continue;
      const daysOverdue = Math.floor((now.getTime() - new Date(tx.dueDate).getTime()) / 86400000);
      const amt = parseFloat(tx.amount);
      inadimplencia.total += amt;
      if (daysOverdue <= 30) inadimplencia.ate30 += amt;
      else if (daysOverdue <= 60) inadimplencia.ate60 += amt;
      else if (daysOverdue <= 90) inadimplencia.ate90 += amt;
      else inadimplencia.acima90 += amt;
    }

    // Clientes devedores (contagem)
    const devedores = await db
      .select({
        clientId: financialTransactions.clientId,
        saldo: sum(financialTransactions.amount),
      })
      .from(financialTransactions)
      .groupBy(financialTransactions.clientId)
      .having(sql`SUM(${financialTransactions.amount}) > 0`);

    // Fluxo de caixa últimos 30 dias (entradas vs saídas por dia)
    const txs = await db
      .select({
        type: financialTransactions.type,
        amount: financialTransactions.amount,
        createdAt: financialTransactions.createdAt,
      })
      .from(financialTransactions)
      .where(gte(financialTransactions.createdAt, thirtyDaysAgo));

    const expsTx = await db
      .select({ amount: expenses.amount, paidAt: expenses.paidAt })
      .from(expenses)
      .where(and(eq(expenses.status, "pago"), gte(expenses.updatedAt, thirtyDaysAgo)));

    // Build daily cashflow map
    const cashflowMap: Record<string, { entradas: number; saidas: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - (29 - i) * 86400000);
      const key = d.toISOString().slice(0, 10);
      cashflowMap[key] = { entradas: 0, saidas: 0 };
    }

    for (const tx of txs) {
      const key = new Date(tx.createdAt).toISOString().slice(0, 10);
      if (!cashflowMap[key]) continue;
      const amt = parseFloat(tx.amount);
      if (tx.type === "payment" || tx.type === "discount") {
        cashflowMap[key].entradas += Math.abs(amt);
      }
    }
    for (const exp of expsTx) {
      if (!exp.paidAt) continue;
      const key = exp.paidAt.toString().slice(0, 10);
      if (!cashflowMap[key]) continue;
      cashflowMap[key].saidas += parseFloat(exp.amount);
    }

    const fluxoCaixa = Object.entries(cashflowMap).map(([date, v]) => ({ date, ...v }));

    return NextResponse.json({
      totalAReceber: parseFloat(toReceive.total ?? "0"),
      totalAPagar: parseFloat(toPay.total ?? "0"),
      totalRecebidoMes: parseFloat(receivedThisMonth.total ?? "0"),
      totalDevedores: devedores.length,
      inadimplencia,
      fluxoCaixa,
    });
  } catch (err) {
    console.error("[GET /api/financeiro/overview]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
