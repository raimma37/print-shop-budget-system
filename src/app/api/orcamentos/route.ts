import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orcamentos, orcamentoItems, clients, users } from "@/db/schema";
import { eq, ilike, or, desc, and } from "drizzle-orm";
import { generateOrcamentoNumber } from "@/lib/utils";

// ID do usuário padrão (sem autenticação própria — módulo integrado)
const DEFAULT_USER_ID = 1;

// ─── Schemas de validação ─────────────────────────────────────────────────────
const OrcamentoItemSchema = z.object({
  productId: z.number().int().positive().optional().nullable(),
  description: z.string().min(1, "Descrição é obrigatória").max(500),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unit: z.string().default("un"),
  unitPrice: z.coerce.number().min(0, "Preço não pode ser negativo"),
  discount: z.coerce.number().min(0).max(100).default(0),
  sortOrder: z.number().int().default(0),
});

const CreateOrcamentoSchema = z.object({
  clientId: z.coerce.number().int().positive("Cliente é obrigatório"),
  status: z.enum(["rascunho", "enviado", "aprovado", "reprovado", "cancelado"]).default("rascunho"),
  // Aceita: null, string vazia, ISO date (yyyy-MM-dd) ou ISO datetime completo
  validUntil: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      // Se vier apenas a data (yyyy-MM-dd), converte para ISO datetime
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return new Date(val + "T12:00:00.000Z").toISOString();
      return val;
    }),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().max(2000).optional().nullable(),
  internalNotes: z.string().max(2000).optional().nullable(),
  items: z.array(OrcamentoItemSchema).default([]),
});

// ─── GET /api/orcamentos ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? "";
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(req.nextUrl.searchParams.get("limit") ?? "50"));
    const offset = (page - 1) * limit;

    // Constrói condições
    const conditions = [];
    if (status) {
      conditions.push(eq(orcamentos.status, status as "rascunho" | "enviado" | "aprovado" | "reprovado" | "cancelado"));
    }
    if (search) {
      conditions.push(
        or(ilike(orcamentos.numero, `%${search}%`), ilike(clients.name, `%${search}%`))
      );
    }

    const rows = await db
      .select({
        id: orcamentos.id,
        numero: orcamentos.numero,
        status: orcamentos.status,
        validUntil: orcamentos.validUntil,
        total: orcamentos.total,
        createdAt: orcamentos.createdAt,
        clientName: clients.name,
        clientEmail: clients.email,
        userName: users.name,
      })
      .from(orcamentos)
      .innerJoin(clients, eq(orcamentos.clientId, clients.id))
      .innerJoin(users, eq(orcamentos.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orcamentos.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/orcamentos]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// ─── POST /api/orcamentos ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Valida corpo da requisição
    const body = await req.json();
    const parsed = CreateOrcamentoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const data = parsed.data;

    const numero = generateOrcamentoNumber();

    // Calcula totais
    let subtotal = 0;
    const itemsToInsert = data.items.map((item, idx) => {
      const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      subtotal += itemTotal;
      return {
        productId: item.productId ?? null,
        description: item.description,
        quantity: String(item.quantity),
        unit: item.unit,
        unitPrice: String(item.unitPrice.toFixed(2)),
        discount: String(item.discount.toFixed(2)),
        total: String(itemTotal.toFixed(2)),
        sortOrder: item.sortOrder ?? idx,
      };
    });

    const total = subtotal - data.discount;

    // Transação Drizzle — garante atomicidade
    const orc = await db.transaction(async (tx) => {
      const [newOrc] = await tx
        .insert(orcamentos)
        .values({
          numero,
          clientId: data.clientId,
          userId: DEFAULT_USER_ID,
          status: data.status,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          subtotal: String(subtotal.toFixed(2)),
          discount: String(data.discount.toFixed(2)),
          total: String(total.toFixed(2)),
          notes: data.notes ?? null,
          internalNotes: data.internalNotes ?? null,
        })
        .returning();

      if (itemsToInsert.length > 0) {
        await tx.insert(orcamentoItems).values(
          itemsToInsert.map((item) => ({ ...item, orcamentoId: newOrc.id }))
        );
      }

      return newOrc;
    });

    return NextResponse.json(orc, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orcamentos]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
