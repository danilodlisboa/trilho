import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isProd = process.env.NODE_ENV === 'production';

  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://api.dicebear.com`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https://api.dicebear.com`;

  const cspHeader = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "style-src-elem 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https://api.dicebear.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.dicebear.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const tokenCookie =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token') ||
    request.cookies.get('next-auth.session-token') ||
    request.cookies.get('__Secure-next-auth.session-token');

  const hasToken = Boolean(tokenCookie && tokenCookie.value && tokenCookie.value.trim() !== '');

  const { pathname } = request.nextUrl;

  let response: NextResponse;

  // Root path: redirect to /dashboard if token cookie exists, otherwise to /login
  if (pathname === '/') {
    if (hasToken) {
      response = NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      response = NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    const isProtectedPath = pathname.startsWith('/board') || pathname.startsWith('/dashboard');

    if (isProtectedPath && !hasToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      response = NextResponse.redirect(loginUrl);
    } else {
      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
