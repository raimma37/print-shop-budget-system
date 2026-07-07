import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // A rota GET é pública para que a tela de login possa carregar o Nome do App
    const rows = await db.select().from(systemSettings).limit(1);
    
    if (rows.length === 0) {
      const [initial] = await db
        .insert(systemSettings)
        .values({
          appName: "GráfikaORC",
          companyName: "Gráfica São João",
          cnpj: "",
          phone: "",
          email: "",
          address: "",
          logoUrl: "",
          themeColor: "amber",
        })
        .returning();
      return NextResponse.json(initial);
    }
    
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[GET /api/settings] Error:", err);
    return NextResponse.json({ error: "Erro ao buscar configurações." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Validação manual de segurança para evitar throws genéricos
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const body = await req.json();
    
    if (!body.appName?.trim()) {
      return NextResponse.json({ error: "Nome do sistema é obrigatório." }, { status: 400 });
    }
    if (!body.companyName?.trim()) {
      return NextResponse.json({ error: "Nome da gráfica é obrigatório." }, { status: 400 });
    }

    const rows = await db.select().from(systemSettings).limit(1);
    let updated;

    if (rows.length === 0) {
      [updated] = await db
        .insert(systemSettings)
        .values({
          appName: body.appName.trim(),
          companyName: body.companyName.trim(),
          cnpj: body.cnpj?.trim() || "",
          phone: body.phone?.trim() || "",
          email: body.email?.trim() || "",
          address: body.address?.trim() || "",
          logoUrl: body.logoUrl?.trim() || "",
          themeColor: body.themeColor?.trim() || "amber",
        })
        .returning();
    } else {
      [updated] = await db
        .update(systemSettings)
        .set({
          appName: body.appName.trim(),
          companyName: body.companyName.trim(),
          cnpj: body.cnpj?.trim() || "",
          phone: body.phone?.trim() || "",
          email: body.email?.trim() || "",
          address: body.address?.trim() || "",
          logoUrl: body.logoUrl?.trim() || "",
          themeColor: body.themeColor?.trim() || "amber",
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, rows[0].id))
        .returning();
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/settings] Error:", err);
    return NextResponse.json({ error: "Erro ao salvar configurações." }, { status: 500 });
  }
}
