import { NextResponse } from "next/server";
import { db } from "@/db";
import { contracts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    
    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
    }

    if (contract.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", contract.fileUrl);
        await unlink(filePath);
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
          console.error("Erro ao excluir o arquivo físico:", err);
        }
      }
    }

    await db.delete(contracts).where(eq(contracts.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar log de contrato:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
