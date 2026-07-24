import { NextResponse } from "next/server";
import { db } from "@/db";
import { contracts, documentTemplates, systemSettings } from "@/db/schema";
import { eq, lte, desc } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

// Função para rodar a limpeza assincronamente (não bloqueia a resposta da API)
async function performCleanup() {
  try {
    const settings = await db.select().from(systemSettings).limit(1);
    const retentionDays = settings[0]?.contractsRetentionDays ?? 30;

    // Calcular data limite
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - retentionDays);

    // Buscar contratos expirados
    const expiredContracts = await db
      .select()
      .from(contracts)
      .where(lte(contracts.createdAt, limitDate));

    if (expiredContracts.length === 0) return;

    for (const contract of expiredContracts) {
      if (contract.fileUrl) {
        try {
          const filePath = path.join(process.cwd(), "public", contract.fileUrl);
          await unlink(filePath);
        } catch (err: any) {
          // Ignorar se o arquivo já não existir
          if (err.code !== 'ENOENT') {
            console.error(`Erro ao deletar arquivo físico do contrato ${contract.id}:`, err);
          }
        }
      }
      
      // Deletar do banco
      await db.delete(contracts).where(eq(contracts.id, contract.id));
    }
    
    console.log(`[Limpeza Automática] Foram excluídos ${expiredContracts.length} contratos expirados (mais de ${retentionDays} dias).`);
  } catch (error) {
    console.error("Erro ao executar limpeza automática:", error);
  }
}

export async function GET() {
  try {
    // 1. Engatilhar limpeza em background
    performCleanup();

    // 2. Buscar e retornar lista atual
    const result = await db
      .select({
        id: contracts.id,
        status: contracts.status,
        fileUrl: contracts.fileUrl,
        createdAt: contracts.createdAt,
        templateName: documentTemplates.name,
      })
      .from(contracts)
      .leftJoin(documentTemplates, eq(contracts.templateId, documentTemplates.id))
      .orderBy(desc(contracts.createdAt));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao listar log de contratos:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
