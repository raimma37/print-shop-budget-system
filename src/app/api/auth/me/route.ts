import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: session }, { status: 200 });
  } catch (err) {
    console.error("Auth me erro:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
