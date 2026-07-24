import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialTransactions, expenses } from "@/db/schema";
import { and, gte, lte, sum, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const from = sp.get("from") ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const to = sp.get("to") ?? new Date().toISOString();

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Total vendido (charges lançadas no período, pagas ou não)
    const [totalVendido] = await db
      .select({ total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.type, "charge"),
          gte(financialTransactions.createdAt, fromDate),
          lte(financialTransactions.createdAt, toDate)
        )
      );

    // Total efetivamente recebido (payments no período)
    const [totalRecebido] = await db
      .select({ total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.type, "payment"),
          gte(financialTransactions.createdAt, fromDate),
          lte(financialTransactions.createdAt, toDate)
        )
      );

    // Descontos concedidos
    const [totalDescontos] = await db
      .select({ total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.type, "discount"),
          gte(financialTransactions.createdAt, fromDate),
          lte(financialTransactions.createdAt, toDate)
        )
      );

    // Juros cobrados
    const [totalJuros] = await db
      .select({ total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.type, "interest"),
          gte(financialTransactions.createdAt, fromDate),
          lte(financialTransactions.createdAt, toDate)
        )
      );

    // Despesas pagas no período
    const [totalDespesas] = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          eq(expenses.status, "pago"),
          gte(expenses.dueDate, from.slice(0, 10)),
          lte(expenses.dueDate, to.slice(0, 10))
        )
      );

    const vendido = parseFloat(totalVendido.total ?? "0");
    const recebido = Math.abs(parseFloat(totalRecebido.total ?? "0"));
    const descontos = Math.abs(parseFloat(totalDescontos.total ?? "0"));
    const juros = parseFloat(totalJuros.total ?? "0");
    const despesas = parseFloat(totalDespesas.total ?? "0");

    const lucroBrutoProjetado = vendido + juros - descontos;
    const lucroBrutoReal = recebido + juros - descontos - despesas;
    const margemReal = recebido > 0 ? ((lucroBrutoReal / recebido) * 100) : 0;

    return NextResponse.json({
      periodo: { from: from.slice(0, 10), to: to.slice(0, 10) },
      totalVendido: vendido,
      totalRecebido: recebido,
      totalDescontos: descontos,
      totalJuros: juros,
      totalDespesas: despesas,
      lucroBrutoProjetado,
      lucroBrutoReal,
      margemReal: parseFloat(margemReal.toFixed(2)),
    });
  } catch (err) {
    console.error("[GET /api/financeiro/relatorios/dre]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
