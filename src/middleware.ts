import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect based on role
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      switch (token?.role) {
        case "SUPER_ADMIN":
          return NextResponse.redirect(new URL("/dashboard/super-admin", req.url));
        case "ADMIN":
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        default:
          return NextResponse.redirect(new URL("/dashboard/staff", req.url));
      }
    }

    // Role-based access control
    if (pathname.startsWith("/dashboard/super-admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/staff", req.url));
    }

    if (pathname.startsWith("/dashboard/admin") && 
        token?.role !== "ADMIN" && 
        token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/staff", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public paths that don't require authentication
        const publicPaths = ["/", "/auth", "/track", "/verify", "/about", "/faq", "/services"];
        if (publicPaths.some((path) => pathname.startsWith(path))) {
          return true;
        }
        
        // Protected paths require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/complaint/:path*"],
};
