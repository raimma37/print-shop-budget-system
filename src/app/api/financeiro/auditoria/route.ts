import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auditLog, users } from "@/db/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const from = sp.get("from") ? new Date(sp.get("from")!) : null;
    const to = sp.get("to") ? new Date(sp.get("to")!) : null;
    const limit = Math.min(200, parseInt(sp.get("limit") ?? "100"));

    const conditions = [];
    if (from) conditions.push(gte(auditLog.createdAt, from));
    if (to) conditions.push(lte(auditLog.createdAt, to));

    const rows = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        details: auditLog.details,
        createdAt: auditLog.createdAt,
        userName: users.name,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/financeiro/auditoria]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
