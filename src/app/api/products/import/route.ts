import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

interface ImportRow {
  nome: string;
  descricao?: string;
  tamanho?: string;
  categoria?: string;
  unidade?: string;
  custo?: number | string;
  preco_base?: number | string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: ImportRow[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Nenhum dado enviado." }, { status: 400 });
    }

    const toInsert = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.nome?.trim()) {
        errors.push({ row: i + 1, message: "Nome é obrigatório" });
        continue;
      }

      const price = parseFloat(String(row.preco_base ?? "0").replace(",", "."));
      const cost = parseFloat(String(row.custo ?? "0").replace(",", "."));

      toInsert.push({
        name: String(row.nome).trim(),
        description: row.descricao?.trim() || null,
        size: row.tamanho?.trim() || null,
        category: row.categoria?.trim() || null,
        unit: row.unidade?.trim() || "un",
        costPrice: String(isNaN(cost) ? "0" : cost.toFixed(2)),
        basePrice: String(isNaN(price) ? "0" : price.toFixed(2)),
      });
    }

    if (toInsert.length === 0) {
      return NextResponse.json(
        { error: "Nenhum produto válido para importar.", errors },
        { status: 422 }
      );
    }

    const chunkSize = 50;
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      await db.insert(products).values(chunk);
      inserted += chunk.length;
    }

    return NextResponse.json({ inserted, errors }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products/import]", err);
    return NextResponse.json({ error: "Erro interno ao importar." }, { status: 500 });
  }
}
