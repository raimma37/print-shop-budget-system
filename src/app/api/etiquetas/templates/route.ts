import { NextResponse } from "next/server";
import { db } from "@/db";
import { labelTemplates } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const templates = await db.select().from(labelTemplates).orderBy(desc(labelTemplates.createdAt));
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Erro ao buscar templates de etiquetas:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, width, height, type, tags, zplCode, htmlCode } = body;

    if (!name || !width || !height || !type) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const [newTemplate] = await db
      .insert(labelTemplates)
      .values({
        name,
        width: width.toString(),
        height: height.toString(),
        type,
        tags: tags ? JSON.stringify(tags) : "[]",
        zplCode: zplCode || null,
        htmlCode: htmlCode || null,
      })
      .returning();

    return NextResponse.json(newTemplate);
  } catch (error: any) {
    console.error("Erro ao criar template de etiqueta:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
