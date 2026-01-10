// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Acessando: ${pathname}`);
  // Libera sempre essas rotas públicas
  if (pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Verifica token no cookie
  const token = request.cookies.get('token')?.value;
  console.log(`[Middleware] Token encontrado: ${token ? 'SIM' : 'NÃO'}`);
  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl, 302);
  }

  console.log(`[Middleware] Token OK → liberando ${pathname}`)
  // Tem token → libera TUDO
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|static).*)',
  ],
};