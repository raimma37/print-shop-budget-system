import { NextResponse } from "next/server";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    console.log("Chegou no DELETE: ", idParam);
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    // 1. Buscar o template no BD
    const [template] = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.id, id));

    if (!template) {
      return NextResponse.json({ error: "Modelo não encontrado." }, { status: 404 });
    }

    // 2. Deletar o registro no banco de dados
    await db.delete(documentTemplates).where(eq(documentTemplates.id, id));

    // 3. Tentar deletar o arquivo fisicamente
    try {
      if (template.fileUrl) {
        const filepath = path.join(process.cwd(), "public", template.fileUrl);
        await unlink(filepath);
      }
    } catch (e) {
      console.warn("Aviso: arquivo físico não pôde ser deletado, ou já não existia.", e);
      // Não falhar se o arquivo já não existir
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
