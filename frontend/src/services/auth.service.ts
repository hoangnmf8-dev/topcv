import { AppError } from "@/exceptions";
import { httpRequest } from "@/lib/utils";
import { success } from "zod";

class AuthServie {
  async getProfile() {
    const response = await httpRequest.get("/auth/profile");
    return response.data;
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
  };
  async login() {
    // try {
    //   const response = httpRequest.
    // } catch(error) {

    // }
  }
}
const authService = new AuthServie();
export default authService;
