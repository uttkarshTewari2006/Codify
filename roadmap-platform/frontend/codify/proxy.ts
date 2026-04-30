import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protect routes that require auth. Public: /, /signin, /signup, /api/*, _next, static.
 * All other paths redirect to /signin with callbackUrl if not authenticated.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  if (isPublic) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      const isOnboarded = token.onboarded;
      if (pathname === "/" || pathname === "/signin" || pathname === "/signup") {
        return NextResponse.redirect(
          new URL(isOnboarded ? "/dashboard" : "/onboarding", request.url)
        );
      }
    }
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signIn = new URL("/signin", request.url);
    if (pathname !== "/") {
      signIn.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(signIn);
  }

  const isOnboarded = token.onboarded;
  if (!isOnboarded && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (isOnboarded && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
