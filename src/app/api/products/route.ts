import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productPackagings } from "@/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const category = req.nextUrl.searchParams.get("category") ?? "";

    const rows = await db.query.products.findMany({
      where: (products, { eq, ilike, or, and }) => {
        const conditions = [eq(products.active, true)];
        if (search) {
          conditions.push(
            or(
              ilike(products.name, `%${search}%`),
              ilike(products.category, `%${search}%`)
            )!
          );
        }
        if (category) {
          conditions.push(eq(products.category, category));
        }
        return and(...conditions);
      },
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        packagings: true,
      },
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const productData = await db.transaction(async (tx) => {
      const [product] = await tx.insert(products).values({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        size: body.size?.trim() || null,
        category: body.category?.trim() || null,
        unit: body.unit?.trim() || "un",
        costPrice: String(parseFloat(body.costPrice ?? "0") || 0),
        basePrice: String(parseFloat(body.basePrice ?? "0") || 0),
        stockQuantity: String(parseFloat(body.stockQuantity ?? "0") || 0),
      }).returning();

      if (body.packagings && Array.isArray(body.packagings) && body.packagings.length > 0) {
        const packagingsToInsert = body.packagings.map((p: any) => ({
          productId: product.id,
          name: p.name?.trim() || "Unidade",
          conversionFactor: String(parseFloat(p.conversionFactor ?? "1") || 1),
          barcode: p.barcode?.trim() || null,
          costPrice: String(parseFloat(p.costPrice ?? "0") || 0),
          sellPrice: String(parseFloat(p.sellPrice ?? "0") || 0),
          isBase: !!p.isBase,
        }));
        await tx.insert(productPackagings).values(packagingsToInsert);
      }

      return product;
    });

    return NextResponse.json(productData, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
