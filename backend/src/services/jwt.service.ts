import jsonwebtoken from "jsonwebtoken";
import { uuidv7 } from "uuidv7";
class JWTService {
  constructor() {

  };
  createAccessToken(accountId: string, role: string) {
    const payload = {
      accountId, 
      role,
      jti: uuidv7()
    };
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET_KEY!, {
      expiresIn: process.env.JWT_EXPIRED as unknown as number
    });
  };
  createRefreshToken(accountId: string, role: string) {
    const payload = {
      accountId, 
      role,
      jti: uuidv7()
    };
    return jsonwebtoken.sign(payload, process.env.JWT_REFRESH_SECRET_KEY!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRED as unknown as number
    });
  };
  verifyAccessToken(accessToken: string) {
    return jsonwebtoken.verify(accessToken, process.env.JWT_SECRET_KEY!);
  };
  verifyRefreshToken(refreshToken: string) {
    return jsonwebtoken.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY!);
  };
  decodeToken(token: string) {
    return jsonwebtoken.decode(token);
  }
};
const jwtService = new JWTService();
export default jwtService;