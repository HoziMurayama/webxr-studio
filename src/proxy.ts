// Next.js 16 Proxy (formerly Middleware). Guards the admin area: any /admin
// route except the login page, and every /api/admin write endpoint, requires a
// valid admin session cookie. Unauthenticated page requests redirect to login;
// unauthenticated API requests get a 401.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  const isAdminApi = pathname.startsWith("/api/admin");
  const isLogin = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isLogin;

  if (isAdminApi && !authed) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  if (isAdminPage && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in and visiting the login page → send to the dashboard.
  if (isLogin && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
