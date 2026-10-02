import { NextRequest, NextResponse } from "next/server";
import { TTL } from "@/constants/ttl.constant";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100";

async function profile(accessToken: string) {
  return fetch(`${backendUrl}/auth/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

export async function proxy(request: NextRequest) {
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let renewed: { newAccessToken: string; newRefreshToken: string } | undefined;
  const finish = (response: NextResponse) => {
    response.headers.set("Cache-Control", "no-store");
    if (renewed) {
      const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
      response.cookies.set("accessToken", renewed.newAccessToken, { ...options, maxAge: TTL.ACCESS_TOKEN });
      response.cookies.set("refreshToken", renewed.newRefreshToken, { ...options, maxAge: TTL.REFRESH_TOKEN });
    }
    return response;
  };

  try {
    let response = accessToken ? await profile(accessToken) : undefined;
    if ((!response || response.status === 401) && refreshToken) {
      const refresh = await fetch(`${backendUrl}/auth/refresh-token`, {
        method: "POST",
        headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
        cache: "no-store",
      });
      const payload = await refresh.json();
      if (refresh.ok && payload.success && payload.data?.newAccessToken && payload.data?.newRefreshToken) {
        renewed = payload.data;
        accessToken = renewed!.newAccessToken;
        response = await profile(accessToken);
      }
    }

    if (response?.ok) {
      const payload = await response.json();
      if (payload.success && payload.data) {
        const destination = payload.data.role === "company" ? "/employer" : payload.data.role === "admin" ? "/admin" : "/";
        const redirect = NextResponse.redirect(new URL(destination, request.url));
        return finish(redirect);
      }
    }
  } catch {
    // A backend outage must not prevent opening the authentication form.
  }

  return finish(NextResponse.next());
}

export const config = {
  matcher: ["/login/:path*", "/register/:path*"],
};
