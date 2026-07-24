import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") ?? "";
    const from = sp.get("from") ?? "";
    const to = sp.get("to") ?? "";

    const conditions = [];
    if (status) conditions.push(eq(expenses.status, status as "pendente" | "pago" | "vencido"));
    if (from) conditions.push(gte(expenses.dueDate, from));
    if (to) conditions.push(lte(expenses.dueDate, to));

    const rows = await db
      .select()
      .from(expenses)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenses.dueDate));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/financeiro/despesas]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.description?.trim()) {
      return NextResponse.json({ error: "Descrição é obrigatória." }, { status: 400 });
    }
    if (!body.dueDate) {
      return NextResponse.json({ error: "Vencimento é obrigatório." }, { status: 400 });
    }
    const amount = parseFloat(String(body.amount ?? "0"));
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    const [expense] = await db
      .insert(expenses)
      .values({
        description: body.description.trim(),
        category: body.category?.trim() || "outros",
        amount: String(amount.toFixed(2)),
        dueDate: body.dueDate,
        status: "pendente",
        recurring: Boolean(body.recurring),
        recurringInterval: body.recurringInterval || null,
        notes: body.notes?.trim() || null,
      })
      .returning();

    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financeiro/despesas]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
