import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token') ||
    request.cookies.get('next-auth.session-token');

  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith('/board') || pathname.startsWith('/dashboard');

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/board/:path*', '/dashboard/:path*', '/login', '/register'],
};
