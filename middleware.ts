// middleware.ts — safe (aucune redirection, juste passe-plat sur les routes privées)
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/app/:path*', '/list/:path*', '/settings/:path*'],
};

export function middleware() {
  return NextResponse.next();
}
