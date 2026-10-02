import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { BadRequest } from "../exceptions";
import { redisClient } from "../utils/redis";
import authService from "./auth.service";
import type {
  googleStartSchema,
  googleCallbackSchema,
} from "../validators/google-auth.validate";

class GoogleAuthService {
  private config() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callback = process.env.GOOGLE_CALLBACK_URL;
    if (!clientId || !clientSecret || !callback)
      throw new BadRequest(
        "Đăng nhập Google chưa được cấu hình",
        "GOOGLE_NOT_CONFIGURED",
      );
    return { clientId, clientSecret, callback };
  }

  async start(input: z.infer<typeof googleStartSchema>) {
    const config = this.config();
    if (!redisClient.isReady)
      throw new BadRequest(
        "Dịch vụ đăng nhập đang khởi động. Vui lòng thử lại sau.",
        "GOOGLE_SESSION_UNAVAILABLE",
      );
    const verifier = randomBytes(32).toString("base64url");
    const saved = await redisClient.set(
      `oauth2:${input.state}`,
      JSON.stringify({ role: input.role, verifier }),
      { EX: 300, NX: true },
    );
    if (!saved)
      throw new BadRequest(
        "Phiên đăng nhập Google không hợp lệ",
        "GOOGLE_INVALID_STATE",
      );
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.callback,
      response_type: "code",
      scope: "openid email profile",
      state: input.state,
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();
    return { url: url.toString() };
  }

  async callback(input: z.infer<typeof googleCallbackSchema>) {
    const config = this.config();
    if (!redisClient.isReady)
      throw new BadRequest(
        "Dịch vụ đăng nhập đang khởi động. Vui lòng thử lại sau.",
        "GOOGLE_SESSION_UNAVAILABLE",
      );
    const stored = await redisClient.getDel(`oauth2:${input.state}`);
    if (!stored)
      throw new BadRequest(
        "Phiên đăng nhập Google đã hết hạn. Vui lòng thử lại.",
        "GOOGLE_INVALID_STATE",
      );
    const { role, verifier } = z
      .object({ role: z.enum(["candidate", "company"]), verifier: z.string() })
      .parse(JSON.parse(stored));
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: input.code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callback,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const tokens = await response.json();
    if (!response.ok || typeof tokens.access_token !== "string")
      throw new BadRequest(
        "Không thể xác thực với Google. Vui lòng thử lại.",
        "GOOGLE_TOKEN_FAILED",
      );
    const userResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        signal: AbortSignal.timeout(15000),
      },
    );
    const user = z
      .object({
        sub: z.string().min(1),
        email: z.email(),
        email_verified: z.literal(true),
        name: z.string().optional(),
        hd: z.string().optional(),
      })
      .safeParse(await userResponse.json());
    if (!userResponse.ok || !user.success)
      throw new BadRequest(
        "Email Google chưa được xác minh",
        "GOOGLE_EMAIL_INVALID",
      );
    return authService.authGoogle(
      user.data.email.toLowerCase(),
      user.data.name ?? user.data.email.split("@")[0]!,
      role,
      !!user.data.hd || user.data.email.toLowerCase().endsWith("@gmail.com"),
      user.data.sub,
    );
  }
}
export default new GoogleAuthService();
