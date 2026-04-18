import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  const isProtectedRoute =
    nextUrl.pathname.startsWith("/posts") ||
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/profile");
  // nextUrl.pathname.startsWith("/auth/reset-password");

  const isAuthRoute =
    nextUrl.pathname.startsWith("/auth/signin") ||
    nextUrl.pathname.startsWith("/auth/signup") ||
    nextUrl.pathname.startsWith("/auth/forgot-password");

  // ✅ redirect logged in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isProtectedRoute && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/posts/:path*",
    "/admin/:path*",
    "/auth/signin",
    "/profile/:path*",
    "/auth/signup",
    "/auth/forgot-password",
    // "/auth/reset-password",
  ],
};
