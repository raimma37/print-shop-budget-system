import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Logout erro:", err);
    return NextResponse.json({ error: "Erro ao fazer logout." }, { status: 500 });
  }
}
