"use server";
import { TTL } from "@/constants/ttl.constant";
import { httpRequest } from "@/lib/utils";
import { LoginInput } from "@/validators/auth.validate";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import authService from "@/services/auth.service";

export async function loginAction(values: LoginInput) {
  try {
    const response = await httpRequest.post("/auth/login", values);
    const cookieStore = await cookies();
    cookieStore.set("accessToken", response.data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TTL.ACCESS_TOKEN,
    });
    cookieStore.set("refreshToken", response.data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TTL.REFRESH_TOKEN,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
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
  if(!cookieStore.get("accessToken")?.value) return;
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
export async function makeRefreshToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return false;
  }
  try {
    const response = await authService.refreshToken(refreshToken);
    cookieStore.set("accessToken", response.data.newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TTL.ACCESS_TOKEN,
    });
    cookieStore.set("refreshToken", response.data.newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TTL.REFRESH_TOKEN,
    });
    return response.data;
  } catch (error) {
    await deleteToken();
    return false;
  }
}
