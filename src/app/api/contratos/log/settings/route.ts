import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const settings = await db.select().from(systemSettings).limit(1);
    
    // Se não existir, retornar o valor padrão do esquema
    if (settings.length === 0) {
      return NextResponse.json({ contractsRetentionDays: 30 });
    }

    return NextResponse.json({ 
      contractsRetentionDays: settings[0].contractsRetentionDays 
    });
  } catch (error: any) {
    console.error("Erro ao buscar configurações de retenção:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { contractsRetentionDays } = body;

    if (typeof contractsRetentionDays !== 'number' || contractsRetentionDays < 1) {
      return NextResponse.json({ error: "Valor de retenção inválido. Deve ser um número maior que 0." }, { status: 400 });
    }

    // Como é white label e settings é global, alteramos ou criamos o primeiro registro
    const settings = await db.select().from(systemSettings).limit(1);
    
    if (settings.length === 0) {
      // Se por algum motivo a tabela estiver vazia, cria um registro inicial
      await db.insert(systemSettings).values({ contractsRetentionDays });
    } else {
      // Atualiza o registro existente
      await db
        .update(systemSettings)
        .set({ contractsRetentionDays, updatedAt: new Date() })
        .where(eq(systemSettings.id, settings[0].id));
    }

    return NextResponse.json({ success: true, contractsRetentionDays });
  } catch (error: any) {
    console.error("Erro ao salvar configuração de retenção:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
