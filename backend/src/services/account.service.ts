import { JwtPayload } from "../types/jwt.type";
import { prisma } from "../utils/prisma";
import { redisClient } from "../utils/redis";
import jwtService from "./jwt.service";

class AccountService {
  constructor() {

  };
  async getAccount(accessToken: string) {
    try {
      const {accountId, jti} = jwtService.verifyAccessToken(accessToken) as unknown as JwtPayload;
      const blacklist = await redisClient.get(`blacklist:${jti}`);
      if(blacklist) return false;
      const account = await prisma.account.findUnique({
        where: {
          id: accountId
        }
      });
      return account;
    } catch(error) {
      return false;
    }
  }
};
const accountService = new AccountService();
export default accountService;