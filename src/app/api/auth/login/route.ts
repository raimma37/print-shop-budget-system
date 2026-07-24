import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();
    const password = body.password;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: "Usuário inativo." }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    // Criar a sessão (isso também já define o cookie)
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
      },
    }, { status: 200 });

  } catch (err) {
    console.error("Login erro:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
