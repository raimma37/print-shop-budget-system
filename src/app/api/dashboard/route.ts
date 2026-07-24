import { NextResponse } from "next/server";
import { db } from "@/db";
import { orcamentos, orcamentoItems, products, clients } from "@/db/schema";
import { eq, count, sum, desc } from "drizzle-orm";

export async function GET() {
  try {
    const [totalClients] = await db.select({ count: count() }).from(clients).where(eq(clients.active, true));

    const statusCounts = await db
      .select({ status: orcamentos.status, count: count(), total: sum(orcamentos.total) })
      .from(orcamentos)
      .groupBy(orcamentos.status);

    const recentOrcamentos = await db
      .select({
        id: orcamentos.id,
        numero: orcamentos.numero,
        status: orcamentos.status,
        total: orcamentos.total,
        createdAt: orcamentos.createdAt,
        clientId: orcamentos.clientId,
      })
      .from(orcamentos)
      .orderBy(desc(orcamentos.createdAt))
      .limit(5);

    // Enriquece com nomes dos clientes
    const allClientsForRecent = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients);
    const fullClientMap: Record<number, string> = {};
    for (const c of allClientsForRecent) fullClientMap[c.id] = c.name;

    const enrichedRecent = recentOrcamentos.map((o) => ({
      ...o,
      clientName: fullClientMap[o.clientId] ?? "—",
    }));

    // ─── Cálculo de Lucratividade (orçamentos aprovados) ─────────────────────
    // Busca todos os itens de orçamentos aprovados que têm produto vinculado
    const aprovadosItems = await db
      .select({
        quantity: orcamentoItems.quantity,
        unitPrice: orcamentoItems.unitPrice,
        discount: orcamentoItems.discount,
        total: orcamentoItems.total,
        costPrice: products.costPrice,
      })
      .from(orcamentoItems)
      .innerJoin(orcamentos, eq(orcamentoItems.orcamentoId, orcamentos.id))
      .innerJoin(products, eq(orcamentoItems.productId, products.id))
      .where(eq(orcamentos.status, "aprovado"));

    let receitaAprovada = 0;
    let custoEstimado = 0;

    for (const item of aprovadosItems) {
      const qty = parseFloat(item.quantity);
      const total = parseFloat(item.total);
      const cost = parseFloat(item.costPrice ?? "0");
      receitaAprovada += total;
      custoEstimado += cost * qty;
    }

    const lucroEstimado = receitaAprovada - custoEstimado;
    const margemMedia = receitaAprovada > 0
      ? Math.round((lucroEstimado / receitaAprovada) * 100)
      : 0;

    const totalAprovado = statusCounts.find((s) => s.status === "aprovado")?.total ?? "0";
    const totalEnviado = statusCounts.find((s) => s.status === "enviado")?.total ?? "0";
    const countAprovado = statusCounts.find((s) => s.status === "aprovado")?.count ?? 0;
    const countEnviado = statusCounts.find((s) => s.status === "enviado")?.count ?? 0;
    const countRascunho = statusCounts.find((s) => s.status === "rascunho")?.count ?? 0;
    const totalAll = statusCounts.reduce((acc, s) => acc + parseFloat(String(s.total ?? "0")), 0);

    return NextResponse.json({
      totalClients: totalClients.count,
      totalAprovado: parseFloat(String(totalAprovado)),
      totalEnviado: parseFloat(String(totalEnviado)),
      countAprovado,
      countEnviado,
      countRascunho,
      totalAll,
      statusCounts,
      recentOrcamentos: enrichedRecent,
      // Lucratividade
      receitaAprovada,
      custoEstimado,
      lucroEstimado,
      margemMedia,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
