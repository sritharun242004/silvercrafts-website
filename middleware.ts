import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Path:", pathname);
  console.log("Session exists:", !!session);
  console.log("User exists:", !!session?.user);
  if (session?.user) {
    console.log("User details:", {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      isTemporary: session.user.isTemporary,
    });
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth",
    "/products",
    "/about",
    "/contact",
    "/quotation",
  ];

  // Admin-only routes
  const adminRoutes = ["/admin", "/studio"];

  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    console.log("Allowing public route");
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to login
  if (!session) {
    console.log("Redirecting unauthenticated user to login");
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has temporary password and is not on change-password page
  if (session.user?.isTemporary && pathname !== "/change-password") {
    console.log("Redirecting user with temporary password");
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (session.user?.role !== "ADMIN") {
      console.log(
        "DENYING ACCESS: User role is",
        session.user?.role,
        "but needs ADMIN"
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
    console.log("ALLOWING ACCESS: User is ADMIN");
  }

  console.log("Allowing access to:", pathname);
  console.log("=== END MIDDLEWARE DEBUG ===");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|assets).*)",
  ],
};
