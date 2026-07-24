import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarInitials: users.avatarInitials,
        active: users.active,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name?.trim() || !body.email?.trim() || !body.password?.trim()) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios." }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);
    const [user] = await db.insert(users).values({
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      passwordHash,
      role: body.role ?? "vendedor",
      avatarInitials: getInitials(body.name.trim()),
      active: true,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarInitials: users.avatarInitials,
      active: users.active,
      createdAt: users.createdAt,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
