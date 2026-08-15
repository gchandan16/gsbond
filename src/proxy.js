import { NextResponse } from "next/server";

export function proxy(request) {
  console.log("middleware calling")

  try {
    const token = request.cookies.get("authToken")?.value;
    const { pathname } = request.nextUrl;

    const isDashboard = pathname.startsWith("/dashboard");
    const isLogin = pathname.startsWith("/login");


    // If not logged in → block dashboard
    if (!token && isDashboard) {
      console.log("🔒 No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If logged in → prevent going back to login
    // if (token && isLogin) {
    //   console.log("✅ Already logged in, redirecting to dashboard");
    //   console.log("Redirecting to:", redirectUrl.toString());
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    if (token && isLogin) {
      const redirectUrl = new URL("/dashboard", request.url);
      console.log("✅ Already logged in, redirecting to:", redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();

  } catch (error) {
    // ✅ Callback - if anything crashes, redirect to login safely
    console.error("❌ Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};