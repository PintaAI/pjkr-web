import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  isPublicRoute,
  isAuthRoute,
  isProtectedRoute,
  isAdminRoute,
  isGuruRoute,
  DEFAULT_AUTH_REDIRECT,
  getRedirectUrl
} from "./lib/routes";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Check for session cookie to handle redirection
  const sessionCookie = getSessionCookie(request);

  // Allow public routes and API routes to pass through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Handle authentication routes
  if (isAuthRoute(pathname)) {
    // If user is already logged in, redirect to default route
    // Role-based redirect is handled in the auth page itself
    if (sessionCookie) {
      return NextResponse.redirect(new URL(getRedirectUrl(), request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname) || isAdminRoute(pathname) || isGuruRoute(pathname)) {
    // If no session cookie, redirect to sign-in
    if (!sessionCookie) {
      // Store the attempted URL for redirect after login
      const redirectUrl = new URL(DEFAULT_AUTH_REDIRECT, request.url);
      redirectUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // For role-specific routes, we'd need to fetch the full session
    // But for performance, we just check cookie existence here
    // Role-based access control should be handled in the actual route handlers
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).+)",
  ],
};