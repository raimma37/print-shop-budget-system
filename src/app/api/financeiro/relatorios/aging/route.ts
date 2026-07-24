import { NextResponse } from "next/server";
import { db } from "@/db";
import { financialTransactions, clients } from "@/db/schema";
import { eq, and, isNull, lt, sum } from "drizzle-orm";

export async function GET() {
  try {
    const now = new Date();

    // Cobranças vencidas não pagas
    const overdueCharges = await db
      .select({
        clientId: financialTransactions.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        totalOverdue: sum(financialTransactions.amount),
      })
      .from(financialTransactions)
      .innerJoin(clients, eq(financialTransactions.clientId, clients.id))
      .where(
        and(
          eq(financialTransactions.type, "charge"),
          isNull(financialTransactions.paidAt),
          lt(financialTransactions.dueDate, now)
        )
      )
      .groupBy(
        financialTransactions.clientId,
        clients.name,
        clients.email,
        clients.phone
      );

    // Para cada cliente, buscar detalhes por faixa de atraso
    const result = await Promise.all(
      overdueCharges.map(async (row) => {
        const txs = await db
          .select({
            id: financialTransactions.id,
            description: financialTransactions.description,
            amount: financialTransactions.amount,
            dueDate: financialTransactions.dueDate,
          })
          .from(financialTransactions)
          .where(
            and(
              eq(financialTransactions.clientId, row.clientId),
              eq(financialTransactions.type, "charge"),
              isNull(financialTransactions.paidAt),
              lt(financialTransactions.dueDate, now)
            )
          );

        const buckets = { ate30: 0, ate60: 0, ate90: 0, acima90: 0 };
        for (const tx of txs) {
          if (!tx.dueDate) continue;
          const days = Math.floor((now.getTime() - new Date(tx.dueDate).getTime()) / 86400000);
          const amt = parseFloat(tx.amount);
          if (days <= 30) buckets.ate30 += amt;
          else if (days <= 60) buckets.ate60 += amt;
          else if (days <= 90) buckets.ate90 += amt;
          else buckets.acima90 += amt;
        }

        const maxDays = txs.length > 0
          ? Math.max(...txs.map((tx) => {
              if (!tx.dueDate) return 0;
              return Math.floor((now.getTime() - new Date(tx.dueDate).getTime()) / 86400000);
            }))
          : 0;

        const riskLevel = maxDays > 90 ? "alto" : maxDays > 60 ? "medio" : "baixo";

        return {
          clientId: row.clientId,
          clientName: row.clientName,
          clientEmail: row.clientEmail,
          clientPhone: row.clientPhone,
          totalOverdue: parseFloat(row.totalOverdue ?? "0"),
          maxDaysOverdue: maxDays,
          riskLevel,
          buckets,
          transactions: txs,
        };
      })
    );

    // Ordena por valor em atraso (maior primeiro)
    result.sort((a, b) => b.totalOverdue - a.totalOverdue);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/financeiro/relatorios/aging]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
