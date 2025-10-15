import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/auth/signin", "/auth/signup"];
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Redirect to signin if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Role-based route protection
    const role = token.role;

    // Admin can access all routes
    if (role === "ADMIN") {
      return NextResponse.next();
    }

    // Route restrictions based on role
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/staff") && !["ADMIN", "STAFF"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      pathname.startsWith("/teacher") &&
      !["ADMIN", "TEACHER"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      pathname.startsWith("/student") &&
      !["ADMIN", "STUDENT"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
