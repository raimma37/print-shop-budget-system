import { NextResponse } from "next/server";
import { db } from "@/db";
import { orcamentos, clients } from "@/db/schema";
import { eq, count, sum, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

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

    // Get client names for recent orcamentos
    const clientIds = [...new Set(recentOrcamentos.map((o) => o.clientId))];
    const clientsData = clientIds.length
      ? await db.select({ id: clients.id, name: clients.name }).from(clients).where(
          clientIds.length === 1
            ? eq(clients.id, clientIds[0])
            : eq(clients.id, clientIds[0]) // fallback, will enrich below
        )
      : [];

    const clientMap: Record<number, string> = {};
    for (const c of clientsData) clientMap[c.id] = c.name;

    // Fetch all client names for recent orcamentos
    const allClientsForRecent = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients);
    const fullClientMap: Record<number, string> = {};
    for (const c of allClientsForRecent) fullClientMap[c.id] = c.name;

    const enrichedRecent = recentOrcamentos.map((o) => ({
      ...o,
      clientName: fullClientMap[o.clientId] ?? "—",
    }));

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
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
