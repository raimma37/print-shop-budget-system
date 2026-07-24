import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('grafika_session');
  
  const { pathname } = request.nextUrl;

  // Rotas públicas que não exigem autenticação
  const publicPaths = ['/login', '/api/auth/login'];
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // Se o usuário já estiver logado e tentar acessar /login, redireciona para o dashboard
    if (sessionCookie && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Se não tem cookie de sessão, bloqueia
  if (!sessionCookie) {
    // Para rotas de API, retorna 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    // Para telas, redireciona para o login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, public folder contents
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
