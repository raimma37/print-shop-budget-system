import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";

    let query = db.select().from(clients).orderBy(desc(clients.createdAt)).$dynamic();

    if (!includeInactive) {
      query = query.where(eq(clients.active, true));
    }

    if (search) {
      query = query.where(
        or(
          ilike(clients.name, `%${search}%`),
          ilike(clients.email, `%${search}%`),
          ilike(clients.cnpjCpf, `%${search}%`)
        )
      );
    }

    const rows = await query;
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

    const [client] = await db.insert(clients).values({
      name: body.name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      cnpjCpf: body.cnpjCpf?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city?.trim() || null,
      state: body.state?.trim() || null,
      notes: body.notes?.trim() || null,
    }).returning();

    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
