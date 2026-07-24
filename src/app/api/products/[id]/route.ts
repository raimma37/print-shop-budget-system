import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productPackagings } from "@/db/schema";
import { eq, notInArray, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const productId = parseInt(id);

    const updatedData = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({
          name: body.name.trim(),
          description: body.description?.trim() || null,
          size: body.size?.trim() || null,
          category: body.category?.trim() || null,
          unit: body.unit?.trim() || "un",
          costPrice: String(parseFloat(body.costPrice ?? "0") || 0),
          basePrice: String(parseFloat(body.basePrice ?? "0") || 0),
          stockQuantity: String(parseFloat(body.stockQuantity ?? "0") || 0),
          active: body.active ?? true,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      if (!updated) {
        return null;
      }

      // Handle packagings
      if (body.packagings && Array.isArray(body.packagings)) {
        const incomingIds = body.packagings.map((p: any) => p.id).filter(Boolean);

        // Delete packagings that are not in the incoming payload anymore
        if (incomingIds.length > 0) {
          await tx
            .delete(productPackagings)
            .where(and(eq(productPackagings.productId, productId), notInArray(productPackagings.id, incomingIds)));
        } else {
          await tx.delete(productPackagings).where(eq(productPackagings.productId, productId));
        }

        // Upsert incoming packagings
        for (const p of body.packagings) {
          if (p.id) {
            await tx
              .update(productPackagings)
              .set({
                name: p.name?.trim() || "Unidade",
                conversionFactor: String(parseFloat(p.conversionFactor ?? "1") || 1),
                barcode: p.barcode?.trim() || null,
                costPrice: String(parseFloat(p.costPrice ?? "0") || 0),
                sellPrice: String(parseFloat(p.sellPrice ?? "0") || 0),
                isBase: !!p.isBase,
                updatedAt: new Date(),
              })
              .where(eq(productPackagings.id, p.id));
          } else {
            await tx.insert(productPackagings).values({
              productId,
              name: p.name?.trim() || "Unidade",
              conversionFactor: String(parseFloat(p.conversionFactor ?? "1") || 1),
              barcode: p.barcode?.trim() || null,
              costPrice: String(parseFloat(p.costPrice ?? "0") || 0),
              sellPrice: String(parseFloat(p.sellPrice ?? "0") || 0),
              isBase: !!p.isBase,
            });
          }
        }
      }

      return updated;
    });

    if (!updatedData) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    return NextResponse.json(updatedData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.update(products).set({ active: false, updatedAt: new Date() }).where(eq(products.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
