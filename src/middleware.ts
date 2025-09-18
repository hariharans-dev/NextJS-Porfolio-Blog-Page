import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/blog/admin/dashboard")) {
    return NextResponse.next();
  }

  try {
    const session = req.cookies.get("session")?.value;

    if (!session) {
      return NextResponse.redirect(new URL("/blog/admin/signin", req.url));
    }

    const res = await fetch(
      `${req.nextUrl.origin}/api/admin/auth?session=${encodeURIComponent(
        session
      )}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      return NextResponse.redirect(new URL("/blog/admin/signin", req.url));
    }
  } catch (err) {
    console.error("Session check failed:", err);
    return NextResponse.redirect(new URL("/blog/admin/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/blog/admin/dashboard/:path*"],
};
