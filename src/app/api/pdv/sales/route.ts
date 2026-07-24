import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posSales, posSaleItems, posPayments, posShifts, users, financialTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { logAudit } from "@/lib/financeiro";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { clientId, cpfCnpj, subtotal, discount, total, offlineId, items, payments } = data;

    const fallbackUserId = 1; // Temporário até integrar contexto real de auth do PDV

    // Fase 2: Buscar turno aberto do usuário. Se não existir, criar um dummy.
    let shiftId = 0;
    const openShifts = await db.select().from(posShifts).where(eq(posShifts.status, "aberto"));
    if (openShifts.length > 0) {
      shiftId = openShifts[0].id;
    } else {
      const [newShift] = await db.insert(posShifts).values({
        userId: fallbackUserId,
        status: "aberto",
        initialCash: "0",
      }).returning({ id: posShifts.id });
      shiftId = newShift.id;
    }

    // 1. Gravar a Venda
    const [sale] = await db.insert(posSales).values({
      shiftId,
      clientId: clientId || null,
      cpfCnpj: cpfCnpj || null,
      status: "finalizada",
      subtotal: String(subtotal),
      discount: String(discount),
      total: String(total),
      offlineId: offlineId || null,
      syncedAt: new Date(),
    }).returning({ id: posSales.id });

    // 2. Gravar Itens e Atualizar Estoque
    if (items && items.length > 0) {
      const dbItems = items.map((i: any) => ({
        saleId: sale.id,
        productId: i.productId,
        packagingId: i.packagingId || null,
        quantity: String(i.quantity),
        unitPrice: String(i.unitPrice),
        discount: String(i.discount),
        total: String(i.total),
      }));
      await db.insert(posSaleItems).values(dbItems);

      // Decrementar estoque base
      for (const i of items) {
        if (i.productId) {
          const qty = parseFloat(i.quantity) || 1;
          const factor = parseFloat(i.conversionFactor) || 1;
          const totalBaseQty = qty * factor;
          
          await db.execute(
            sql`UPDATE products SET stock_quantity = stock_quantity - ${totalBaseQty} WHERE id = ${i.productId}`
          );
        }
      }
    }

    // 3. Gravar Pagamentos
    if (payments && payments.length > 0) {
      const dbPayments = payments.map((p: any) => ({
        saleId: sale.id,
        method: p.method,
        amount: String(p.amount),
      }));
      await db.insert(posPayments).values(dbPayments);
    }

    // 4. Integração Financeira Automática (Caixa Central)
    // Para simplificar, lançamos uma transação consolidada de crédito
    await db.insert(financialTransactions).values({
      clientId: clientId || 1, // Usar 1 (Cliente Avulso) se for nulo, apenas para manter consistência no fluxo
      type: "payment",
      category: "pdv",
      description: `Venda PDV #${sale.id}`,
      amount: String(-Math.abs(total)), // Crédito é negativo no ledger
      paymentMethod: payments?.[0]?.method || "dinheiro", // Simplificação do meio principal
      paidAt: new Date(),
      createdBy: fallbackUserId,
    });

    await logAudit("pdv_sale_created", "pos_sales", sale.id, { total }, fallbackUserId);

    return NextResponse.json({ success: true, saleId: sale.id });
  } catch (error: any) {
    console.error("Erro ao registrar venda no PDV:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
