import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";
import { success } from "zod";

class AuthServie {
  async getProfile() {
    const response = await httpRequest.get("/auth/profile");
    return response.data;
  }
  async refreshToken(refreshToken: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/refresh-token`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
        },
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Không có quyền truy cập");
    }
    return response.json();
  }
  async changePassword(accountId: string, password: string) {
    const response = await httpRequest.post("auth/change-password", {
      accountId,
      password,
    });
    if (!response.data.success) {
      return {
        success: false,
        message: "Đã có lỗi xảy ra",
        status: 500,
      };
    }
    return {
      success: true,
      message: "Thay đổi mật khẩu thành công",
      status: 201,
    };
  }
}
const authService = new AuthServie();
export default authService;
