import { httpRequest } from "@/lib/utils";

class AuthServie {
  async getProfile() {
    const response = await httpRequest.get("/auth/profile");
    return response;
  }

  async refreshToken(refreshToken: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/refresh-token`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`
        },
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Không có quyền truy cập");
    };
    return response.json();
  }
}
const authService = new AuthServie();
export default authService;
