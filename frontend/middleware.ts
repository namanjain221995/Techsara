import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect these specific routes
  const isProtectedRoute =
    pathname.startsWith('/auth/dashboard') ||
    pathname.startsWith('/auth/editor');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token invalid or expired → back to login
    return NextResponse.redirect(new URL('/auth', req.url));
  }
}

export const config = {
  matcher: ['/auth/dashboard/:path*', '/auth/editor/:path*'],
};
