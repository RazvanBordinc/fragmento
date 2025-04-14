/** @format */

import { NextResponse } from "next/server";

export function middleware(request) {
  // Get pathname
  const pathname = request.nextUrl.pathname;

  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // Check if path requires authentication
  const isAuthRoute = pathname.startsWith("/app");

  // Check if path is auth-related
  const isLoginPage = pathname === "/";

  // If trying to access protected route without token, redirect to login
  if (isAuthRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If already logged in and trying to access login page, redirect to app
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Add paths that should be checked by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
