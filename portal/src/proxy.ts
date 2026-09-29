import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 proxy (replaces middleware).
 * Performs a lightweight, optimistic auth check by looking for the
 * NextAuth session cookie. If no cookie exists, redirect to /sign-in.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Check for NextAuth session token cookie
    const hasSession =
      request.cookies.has("next-auth.session-token") ||
      request.cookies.has("__Secure-next-auth.session-token");

    if (!hasSession) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard(.*)"],
};
