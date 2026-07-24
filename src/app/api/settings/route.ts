import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
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
          glassEffect: false,
          pdfAccentColor: "#f59e0b",
          pdfFooterText: "",
          pdfValidityText: "Este orçamento é válido por 30 dias a partir da data de emissão.",
          pdfTermsText: "",
          pdfShowLogo: true,
          pdfShowCnpj: true,
          pdfShowPhone: true,
          pdfShowEmail: true,
          pdfShowAddress: true,
          pdfHeaderLayout: "logo-left",
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
    const body = await req.json();

    if (!body.appName?.trim()) {
      return NextResponse.json({ error: "Nome do sistema é obrigatório." }, { status: 400 });
    }
    if (!body.companyName?.trim()) {
      return NextResponse.json({ error: "Nome da gráfica é obrigatório." }, { status: 400 });
    }

    const setData = {
      appName: body.appName.trim(),
      companyName: body.companyName.trim(),
      cnpj: body.cnpj?.trim() || "",
      phone: body.phone?.trim() || "",
      email: body.email?.trim() || "",
      address: body.address?.trim() || "",
      logoUrl: body.logoUrl?.trim() || "",
      themeColor: body.themeColor?.trim() || "amber",
      glassEffect: body.glassEffect === true,
      // Campos PDF
      pdfAccentColor: body.pdfAccentColor?.trim() || "#f59e0b",
      pdfFooterText: body.pdfFooterText?.trim() || "",
      pdfValidityText: body.pdfValidityText?.trim() || "Este orçamento é válido por 30 dias a partir da data de emissão.",
      pdfTermsText: body.pdfTermsText?.trim() || "",
      pdfShowLogo: body.pdfShowLogo !== false,
      pdfShowCnpj: body.pdfShowCnpj !== false,
      pdfShowPhone: body.pdfShowPhone !== false,
      pdfShowEmail: body.pdfShowEmail !== false,
      pdfShowAddress: body.pdfShowAddress !== false,
      pdfHeaderLayout: body.pdfHeaderLayout?.trim() || "logo-left",
      updatedAt: new Date(),
    };

    const rows = await db.select().from(systemSettings).limit(1);
    let updated;

    if (rows.length === 0) {
      [updated] = await db
        .insert(systemSettings)
        .values(setData)
        .returning();
    } else {
      [updated] = await db
        .update(systemSettings)
        .set(setData)
        .where(eq(systemSettings.id, rows[0].id))
        .returning();
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/settings] Error:", err);
    return NextResponse.json({ error: "Erro ao salvar configurações." }, { status: 500 });
  }
}
