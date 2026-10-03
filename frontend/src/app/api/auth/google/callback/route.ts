import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { TTL } from "@/constants/ttl.constant";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const expected = request.cookies.get("googleOAuthState")?.value ?? "";
  let response: NextResponse;
  try {
    if (
      !/^[a-f0-9]{64}$/.test(state) ||
      expected.length !== state.length ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(expected))
    )
      throw new Error("Invalid state");
    if (request.nextUrl.searchParams.has("error")) {
      response = NextResponse.redirect(
        new URL("/login?authError=google_cancelled", request.url),
      );
    } else {
      const code = request.nextUrl.searchParams.get("code");
      if (!code) throw new Error("Missing code");
      const backend =
        process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100";
      const result = await fetch(`${backend}/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
        cache: "no-store",
        signal: AbortSignal.timeout(35000),
      });
      const payload = await result.json();
      const session = payload.data;
      if (
        !result.ok ||
        !payload.success ||
        typeof session?.accessToken !== "string" ||
        typeof session?.refreshToken !== "string" ||
        !["company", "candidate"].includes(session.role)
      )
        throw new Error("Google callback failed");
      response = NextResponse.redirect(
        new URL(session.role === "company" ? "/employer" : "/", request.url),
      );
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };
      response.cookies.set("accessToken", session.accessToken, {
        ...options,
        maxAge: TTL.ACCESS_TOKEN,
      });
      response.cookies.set("refreshToken", session.refreshToken, {
        ...options,
        maxAge: TTL.REFRESH_TOKEN,
      });
    }
  } catch {
    response = NextResponse.redirect(
      new URL("/login?authError=google_failed", request.url),
    );
  }
  response.cookies.set("googleOAuthState", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/api/auth/google",
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
