import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "grafika-orc-dev-secret");
const COOKIE_NAME = "grafika_session";

const PUBLIC_PREFIXES = ["/login", "/api/auth/login", "/api/auth/logout", "/api/health", "/_next", "/favicon"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rotas públicas e arquivos estáticos
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname.includes(".")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, getJwtSecret());
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
