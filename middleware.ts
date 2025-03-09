import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("spiritx_token")?.value;
  console.log("Middleware: Checking auth token", {
    tokenExists: !!token,
    pathname: request.nextUrl.pathname,
  });
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/signup", "/"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // API routes that don't require authentication
  const publicApiRoutes = ["/api/auth/login", "/api/auth/signup", "/api/seed"];
  const isPublicApiRoute = publicApiRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // If it's a public route or public API route, allow access
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // If there's no token and it's not a public route, redirect to login
  if (!token) {
    const url = new URL("/auth/login", request.url);
    return NextResponse.redirect(url);
  }

  // If it's an admin route, verify admin role
  if (isAdminRoute) {
    try {
      // This is a simple check - in a real app, you'd verify the token and check the role
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      console.log("Middleware: Admin route check", {
        username: payload.username,
        role: payload.role,
        isAdmin: payload.role === "admin",
      });

      if (payload.role !== "admin") {
        console.log("Middleware: Redirecting non-admin from admin route");
        // If not admin, redirect to user dashboard
        const url = new URL("/user/players", request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If token is invalid, redirect to login
      const url = new URL("/auth/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for static files, api routes that don't need auth, and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
