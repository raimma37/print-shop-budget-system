import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productUnits } from "@/db/schema";
import { asc } from "drizzle-orm";

const DEFAULT_UNITS = [
  { name: "Unidade", abbreviation: "un", sortOrder: 0 },
  { name: "Metro quadrado", abbreviation: "m²", sortOrder: 1 },
  { name: "Metro linear", abbreviation: "m", sortOrder: 2 },
  { name: "Centímetro", abbreviation: "cm", sortOrder: 3 },
  { name: "Quilômetro", abbreviation: "km", sortOrder: 4 },
  { name: "Milhar", abbreviation: "mil", sortOrder: 5 },
  { name: "Hora", abbreviation: "h", sortOrder: 6 },
  { name: "Dia", abbreviation: "dia", sortOrder: 7 },
  { name: "Quilograma", abbreviation: "kg", sortOrder: 8 },
  { name: "Litro", abbreviation: "L", sortOrder: 9 },
];

export async function GET() {
  try {
    let rows = await db
      .select()
      .from(productUnits)
      .orderBy(asc(productUnits.sortOrder), asc(productUnits.name));

    if (rows.length === 0) {
      await db.insert(productUnits).values(DEFAULT_UNITS);
      rows = await db
        .select()
        .from(productUnits)
        .orderBy(asc(productUnits.sortOrder), asc(productUnits.name));
    }

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/units] Error:", err);
    return NextResponse.json({ error: "Erro ao buscar unidades." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da unidade é obrigatório." }, { status: 400 });
    }
    if (!body.abbreviation?.trim()) {
      return NextResponse.json({ error: "Abreviação é obrigatória." }, { status: 400 });
    }

    const count = await db.select().from(productUnits);
    const [created] = await db
      .insert(productUnits)
      .values({
        name: body.name.trim(),
        abbreviation: body.abbreviation.trim(),
        sortOrder: count.length,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[POST /api/units] Error:", err);
    return NextResponse.json({ error: "Erro ao criar unidade." }, { status: 500 });
  }
}
