import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role") === "company" ? "company" : "candidate";
  const state = randomBytes(32).toString("hex");
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100";
    const result = await fetch(`${backend}/auth/google?${new URLSearchParams({ role, state })}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    const payload = await result.json();
    if (!result.ok || !payload.success || !payload.data?.url) throw new Error("Google start failed");
    const response = NextResponse.redirect(payload.data.url);
    response.cookies.set("googleOAuthState", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 300, path: "/api/auth/google" });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?authError=google_unavailable", request.url));
  }
}
