"use server";

import { TTL } from "@/constants/ttl.constant";
import type { LoginInput, RegisterInput } from "@/validators/auth.validate";
import { cookies } from "next/headers";

type BackendResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { message?: string };
};

type AuthActionResult<T = undefined> =
  | { success: true; data: T; message: string }
  | { success: false; message: string };

type Session = { accessToken: string; refreshToken: string };

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100";

function messageFrom(response: BackendResponse<unknown>, fallback: string) {
  return response.errors?.message ?? response.message ?? fallback;
}

async function post<T>(path: string, body: unknown) {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as BackendResponse<T>;
    if (!response.ok || !payload.success || payload.data === undefined) {
      return {
        result: {
          success: false as const,
          message: messageFrom(payload, "Không thể kết nối với máy chủ. Vui lòng thử lại."),
        },
        response,
      };
    }
    return {
      result: { success: true as const, data: payload.data, message: payload.message ?? "Thành công" },
      response,
    };
  } catch {
    return {
      result: { success: false as const, message: "Không thể kết nối với máy chủ. Vui lòng thử lại." },
      response: undefined,
    };
  }
}

async function saveSession(session: Session) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  cookieStore.set("accessToken", session.accessToken, { ...options, maxAge: TTL.ACCESS_TOKEN });
  cookieStore.set("refreshToken", session.refreshToken, { ...options, maxAge: TTL.REFRESH_TOKEN });
}

function refreshTokenFrom(response: Response | undefined) {
  if (!response) return undefined;
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const values = headers.getSetCookie?.() ?? [response.headers.get("set-cookie") ?? ""];
  const cookie = values.find((value) => value.startsWith("refreshToken="));
  return cookie?.match(/^refreshToken=([^;]+)/)?.[1];
}

export async function registerAction(values: RegisterInput, role: "candidate" | "company"): Promise<AuthActionResult> {
  const { result } = await post("/auth/register", {
    role,
    fullName: role === "company" ? values.companyName : values.fullName,
    email: values.email,
    phone: values.phone.replace(/[.\s-]/g, "") || undefined,
    password: values.password,
    confirmPassword: values.confirmPassword,
  });
  if (!result.success) return result;
  return { success: true, data: undefined, message: result.message };
}

export async function verifyRegistrationAction(email: string, otp: string): Promise<AuthActionResult> {
  const { result, response } = await post<string>("/auth/register-verify-email", { email, otp });
  if (!result.success) return result;
  const refreshToken = refreshTokenFrom(response);
  if (!refreshToken) return { success: false, message: "Không thể tạo phiên đăng nhập. Vui lòng đăng nhập lại." };
  await saveSession({ accessToken: result.data, refreshToken });
  return { success: true, data: undefined, message: result.message };
}

export async function resendVerificationAction(email: string): Promise<AuthActionResult> {
  const { result } = await post<Record<string, never>>("/auth/resend-verify-email", { email });
  if (!result.success) return result;
  return { success: true, data: undefined, message: result.message };
}

export async function loginAction(values: LoginInput): Promise<AuthActionResult> {
  const { result } = await post<Session>("/auth/login", values);
  if (!result.success) return result;
  await saveSession(result.data);
  return { success: true, data: undefined, message: result.message };
}

export async function getProfileAction(): Promise<AuthActionResult<unknown>> {
  let accessToken = await getAccesToken();
  if (!accessToken && await makeRefreshToken()) accessToken = await getAccesToken();
  if (!accessToken) {
    return { success: false, message: "Phiên đăng nhập đã hết hạn." };
  }
  try {
    const send = () => fetch(`${backendUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    let response = await send();
    if (response.status === 401 && await makeRefreshToken()) {
      accessToken = await getAccesToken();
      response = await send();
    }
    const payload = (await response.json().catch(() => ({}))) as BackendResponse<unknown>;
    if (!response.ok || !payload.success || payload.data === undefined) {
      return { success: false, message: messageFrom(payload, "Không thể tải hồ sơ.") };
    }
    return { success: true, data: payload.data, message: payload.message ?? "Thành công" };
  } catch {
    return { success: false, message: "Không thể kết nối với máy chủ. Vui lòng thử lại." };
  }
}

export async function getAccesToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken")?.value;
}

export async function deleteToken() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

export async function makeRefreshToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
      },
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as BackendResponse<{
      newAccessToken: string;
      newRefreshToken: string;
    }>;
    if (!response.ok || !payload.success || !payload.data?.newAccessToken || !payload.data?.newRefreshToken) {
      if (response.status === 401) await deleteToken();
      return false;
    }
    await saveSession({
      accessToken: payload.data.newAccessToken,
      refreshToken: payload.data.newRefreshToken,
    });
    return true;
  } catch {
    return false;
  }
}

export async function logoutAction(): Promise<{ success: boolean; message?: string }> {
  let accessToken = await getAccesToken();
  let refreshToken = await getRefreshToken();
  if (!accessToken && !refreshToken) {
    await deleteToken();
    return { success: true };
  }
  try {
    if (!accessToken && refreshToken) {
      if (!await makeRefreshToken()) {
        if (await getRefreshToken()) return { success: false, message: "Không thể kết nối để đăng xuất. Vui lòng thử lại." };
        await deleteToken();
        return { success: true };
      }
      accessToken = await getAccesToken();
      refreshToken = await getRefreshToken();
    }
    const send = () => fetch(
      (process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100") + "/auth/logout",
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + (accessToken ?? ""),
          Cookie: "refreshToken=" + encodeURIComponent(refreshToken ?? ""),
        },
        cache: "no-store",
      },
    );
    let response = await send();
    if (response.status === 401) {
      if (!await makeRefreshToken()) {
        if (await getRefreshToken()) return { success: false, message: "Không thể kết nối để đăng xuất. Vui lòng thử lại." };
        await deleteToken();
        return { success: true };
      }
      accessToken = await getAccesToken();
      refreshToken = await getRefreshToken();
      response = await send();
    }
    if (!response.ok) return { success: false, message: "Không thể đăng xuất. Vui lòng thử lại." };
    await deleteToken();
    return { success: true };
  } catch {
    return { success: false, message: "Không thể kết nối để đăng xuất. Vui lòng thử lại." };
  }
}
