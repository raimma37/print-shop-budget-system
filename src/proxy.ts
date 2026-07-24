import { type NextRequest, NextResponse } from "next/server";

// Middleware simplificado — sem autenticação própria.
// O sistema pai é responsável pela segurança/identidade.
export default function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
