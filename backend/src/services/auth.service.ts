import { uuidv7 } from "zod";
import {
  AccountBlockedError,
  AccountNotFoundError,
  BadRequest,
  ConflictError,
  InvalidCredentialsError,
  Unauthorized,
} from "../exceptions";
import {
  CandidateInfoRegister,
  CompanyInfoRegister,
  LoginInfo,
} from "../types/auth.type";
import { JwtPayload } from "../types/jwt.type";
import { prisma } from "../utils/prisma";
import { redisClient } from "../utils/redis";
import candidateService from "./candidate.service";
import companyService from "./company.service";
import jwtService from "./jwt.service";
import cryptoRandomString from "crypto-random-string";
import { hashString, verifyString } from "../utils/hashing";
import { emailQueue } from "../queues/email.queue";
import { QUEUE_JOB_NAME } from "../constants/queue.contant";
import { ROLE } from "../constants/role.constants";
import { ERROR_MESSAGE } from "../constants/message.constant";
import { ERROR_CODE } from "../constants/code.constant";
import { TTL } from "../constants/ttl.constant";

class AuthService {
  constructor() {}
  async candidateRegister(candidateInfo: CandidateInfoRegister) {
    const isExistCandidate = await prisma.account.findUnique({
      where: {
        email: candidateInfo.email,
      },
    });
    if (isExistCandidate) {
      throw new ConflictError(
        ERROR_MESSAGE.AUTH_SERVICE.EMAIL_ALREADY_EXISTS,
        ERROR_CODE.AUTH_SERVICE.EMAIL_ALREADY_EXISTS,
      );
    }
    const newCandidateAccount =
      await candidateService.createCandidate(candidateInfo);
    const otp = cryptoRandomString({ length: 6, type: "numeric" }) as string;
    const otpHash = hashString(otp);
    await redisClient.setEx(
      `otp:register:${newCandidateAccount.id}`,
      TTL.AUTH_SERVICE.OTP_REGISTER,
      otpHash,
    );
    //Thêm job vào queue
    await emailQueue.add(QUEUE_JOB_NAME.AUTH_SEND_VERIFY_EMAIL, {
      recipientEmail: candidateInfo.email,
      templateId: "email-verification",
      variables: {
        VERIFY_CODE: otp,
        EXPIRES_MINUTES: `${TTL.AUTH_SERVICE.OTP_REGISTER / 60}`,
      },
    });
    return newCandidateAccount;
  }
  async companyRegister(companyInfo: CompanyInfoRegister) {
    const isExistCompany = await prisma.account.findUnique({
      where: {
        email: companyInfo.email,
      },
    });
    if (isExistCompany) {
      throw new ConflictError(
        ERROR_MESSAGE.AUTH_SERVICE.EMAIL_ALREADY_EXISTS,
        ERROR_CODE.AUTH_SERVICE.EMAIL_ALREADY_EXISTS,
      );
    }
    const newCompanyAccount = await companyService.createCompany(companyInfo);
    //Tạo otp và lưu trong redis
    const otp = cryptoRandomString({ length: 6, type: "numeric" }) as string;
    const otpHash = hashString(otp);
    await redisClient.setEx(
      `otp:register:${newCompanyAccount.id}`,
      TTL.AUTH_SERVICE.OTP_REGISTER,
      otpHash,
    );
    //Thêm job vào queue
    await emailQueue.add(QUEUE_JOB_NAME.AUTH_SEND_VERIFY_EMAIL, {
      recipientEmail: companyInfo.email,
      templateId: "email-verification",
      variables: {
        VERIFY_CODE: otp,
        EXPIRES_MINUTES: `${TTL.AUTH_SERVICE.OTP_REGISTER / 60}`,
      },
    });
    return newCompanyAccount;
  }
  async registerVerifyEmail(email: string, otp: string) {
    const newAccount = await prisma.account.findUnique({
      where: {
        email,
      },
    });
    if (!newAccount) {
      throw new AccountNotFoundError(
        ERROR_MESSAGE.AUTH_SERVICE.ACCOUNT_NOT_FOUND,
        ERROR_CODE.AUTH_SERVICE.ACCOUNT_NOT_FOUND,
      );
    }
    //Kiểm tra otp
    const otpHash = await redisClient.get(`otp:register:${newAccount.id}`);
    if (!otpHash) {
      throw new BadRequest(ERROR_MESSAGE.AUTH_SERVICE.OTP_INVALID, ERROR_CODE.AUTH_SERVICE.OTP_INVALID);
    }
    if (!verifyString(otp, otpHash)) {
      throw new BadRequest(ERROR_MESSAGE.AUTH_SERVICE.OTP_INVALID, ERROR_CODE.AUTH_SERVICE.OTP_INVALID);
    }
    await prisma.account.update({
      where: {
        id: newAccount.id,
      },
      data: {
        verfifyEmail: true,
      },
    });
    const accessToken = jwtService.createAccessToken(
      newAccount.id,
      newAccount.role,
    );
    const refreshToken = jwtService.createRefreshToken(
      newAccount.id,
      newAccount.role,
    );
    //Lưu refresh token vào redis
    await this.saveRefreshToken(accessToken, refreshToken);
    await redisClient.del(`otp:register:${newAccount.id}`);
    return { accessToken, refreshToken };
  }
  async resendVerifyEmail(email: string) {
    const newAccount = await prisma.account.findUnique({
      where: {
        email,
      },
    });
    if (!newAccount) {
      throw new AccountNotFoundError(
        ERROR_MESSAGE.AUTH_SERVICE.ACCOUNT_NOT_FOUND,
        ERROR_CODE.AUTH_SERVICE.ACCOUNT_NOT_FOUND,
      );
    }
    await redisClient.del(`otp:register:${newAccount.id}`);
    const otp = cryptoRandomString({ length: 6, type: "numeric" }) as string;
    const otpHash = hashString(otp);
    await redisClient.setEx(
      `otp:register:${newAccount.id}`,
      TTL.AUTH_SERVICE.OTP_REGISTER,
      otpHash,
    );
    //Thêm job vào queue
    await emailQueue.add(QUEUE_JOB_NAME.AUTH_SEND_VERIFY_EMAIL, {
      recipientEmail: email,
      templateId: "email-verification",
      variables: {
        VERIFY_CODE: otp,
        EXPIRES_MINUTES: `${TTL.AUTH_SERVICE.OTP_REGISTER / 60}`,
      },
    });
  }
  async login(loginInfo: LoginInfo) {
    const { email, password } = loginInfo;
    const existAccount = await prisma.account.findUnique({
      where: {
        email,
      },
    });
    if (!existAccount) {
      throw new InvalidCredentialsError(
        ERROR_MESSAGE.AUTH_SERVICE.INVALID_CREDENTIALS,
        ERROR_CODE.AUTH_SERVICE.INVALID_CREDENTIALS,
      );
    }
    if (!verifyString(password, existAccount.passwordHash)) {
      throw new InvalidCredentialsError(
        ERROR_MESSAGE.AUTH_SERVICE.INVALID_CREDENTIALS,
        ERROR_CODE.AUTH_SERVICE.INVALID_CREDENTIALS,
      );
    }
    if (existAccount && existAccount.status === "blocked") {
      throw new AccountBlockedError(
        ERROR_MESSAGE.AUTH_SERVICE.ACCOUNT_BLOCKED,
        ERROR_CODE.AUTH_SERVICE.ACCOUNT_BLOCKED,
      );
    }
    const accessToken = jwtService.createAccessToken(
      existAccount.id,
      existAccount.role,
    );
    const refreshToken = jwtService.createRefreshToken(
      existAccount.id,
      existAccount.role,
    );
    //Lưu redis
    await this.saveRefreshToken(accessToken, refreshToken);
    return { accessToken, refreshToken };
  }
  async getProfile(accessToken: string) {
    const { accountId, jti, role } = jwtService.decodeToken(
      accessToken,
    ) as unknown as JwtPayload;
    const blacklist = await redisClient.get(`blacklist:${jti}`);
    if (blacklist) {
      throw new Unauthorized(
        ERROR_MESSAGE.AUTH_SERVICE.UNAUTHORIZED,
        ERROR_CODE.AUTH_SERVICE.UNAUTHORIZED,
      );
    }
    let options: any = {};
    if (role === "candidate") {
      options.role = "candidate";
      options.condition = {
        omit: {
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      };
    }
    if (role === "company") {
      options.role = "company";
      options.condition = {
        omit: {
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      };
    }
    const existProfile = await prisma.account.findUnique({
      where: {
        id: accountId,
        status: "active",
      },
      select: {
        id: true,
        email: true,
        [options.role]: options.condition,
      },
    });
    return existProfile;
  }
  async logout(accessToken: string, refreshToken: string) {
    const { exp, jti } = jwtService.decodeToken(accessToken) as JwtPayload;
    const decodedRefreshToken = jwtService.decodeToken(
      refreshToken,
    ) as JwtPayload;
    const ttl = exp - Math.floor(Date.now() / 1000);
    await redisClient.setEx(`blacklist:${jti}`, ttl, "1");
    await redisClient.del(
      `refreshToken:${decodedRefreshToken.accountId}:${decodedRefreshToken.jti}`,
    );
    return true;
  }
  async saveRefreshToken(accessToken: string, refreshToken: string) {
    const { accountId, role, jti, exp } = jwtService.decodeToken(
      refreshToken,
    ) as JwtPayload;
    const { jti: jtiAccessToken, exp: expAccessToken } = jwtService.decodeToken(
      accessToken,
    ) as JwtPayload;
    const ttlRefreshToken = Math.ceil(exp - Date.now() / 1000);
    await redisClient.setEx(
      `refreshToken:${accountId}:${jti}`,
      ttlRefreshToken,
      JSON.stringify({
        access: jtiAccessToken,
        refresh: jti,
        accountId,
        role,
      }),
    );
  }
  async getNewToken(refreshToken: string) {
    const decodedRefreshToken = jwtService.decodeToken(
      refreshToken,
    ) as JwtPayload;
    const isExistInRedis = await redisClient.get(
      `refreshToken:${decodedRefreshToken.accountId}:${decodedRefreshToken.jti}`,
    );
    if (!decodedRefreshToken || !isExistInRedis) {
      throw new Unauthorized(
        ERROR_MESSAGE.AUTH_SERVICE.INVALID_TOKEN,
        ERROR_CODE.AUTH_SERVICE.INVALID_TOKEN,
      );
    };
    const newAccessToken = jwtService.createAccessToken(
      decodedRefreshToken.accountId,
      decodedRefreshToken.role,
    );
    const newRefreshToken = jwtService.createRefreshToken(
      decodedRefreshToken.accountId,
      decodedRefreshToken.role,
    );
    await redisClient.del(
      `refreshToken:${decodedRefreshToken.accountId}:${decodedRefreshToken.jti}`,
    );
    await this.saveRefreshToken(newAccessToken, newRefreshToken);
    return { newAccessToken, newRefreshToken };
  }
  async forgotPassword(email: string) {
    const account = await prisma.account.findUnique({
      where: {
        email,
      },
    });
    if (!account) {
      throw new AccountNotFoundError(
        ERROR_MESSAGE.AUTH_SERVICE.ACCOUNT_NOT_FOUND,
        ERROR_CODE.AUTH_SERVICE.ACCOUNT_NOT_FOUND,
      );
    }
    const otp = cryptoRandomString({ length: 6, type: "numeric" }) as string;
    const otpHash = hashString(otp);
    await redisClient.setEx(
      `otp:fortgot_password:${account.id}`,
      TTL.AUTH_SERVICE.OTP_FORGOT_PASSWORD,
      otpHash,
    );
    //Thêm job vào queue
    await emailQueue.add(QUEUE_JOB_NAME.AUTH_SEND_FORGOT_PASSWORD_EMAIL, {
      recipientEmail: email,
      templateId: "forgot-password",
      variables: {
        OTP: otp,
        EXPIRE_MINUTES: `${TTL.AUTH_SERVICE.OTP_FORGOT_PASSWORD / 60}`,
      },
    });
    return account;
  }
  async resetForgotPassword(accountId: string, password: string) {
    const hashedPassword = hashString(password);
    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        passwordHash: hashedPassword,
      },
    });
  }
  async changePassword(accountId: string, password: string) {
    const hashedPassword = hashString(password);
    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        passwordHash: hashedPassword,
      },
    });
  }
  async authGoogle(
    email: string,
    name: string,
    state: string,
    picture?: string,
  ) {
    const role = await redisClient.get(`oauth2:${state}`);
    console.log("🚀 ~ AuthService ~ authGoogle ~ role:", role)
    let newAccount: any;
    const existAccount = await prisma.account.findUnique({
      where: {
        email,
      },
    });
    //Đăng kí
    if (!existAccount) {
      if (role === ROLE.CANDIDATE) {
        newAccount = await candidateService.createCandidate({
          role,
          email,
          fullName: name,
        });
      }
      if (role === ROLE.COMPANY) {
        newAccount = await companyService.createCompany({
          role,
          email,
          fullName: name,
        });
      }
    };
    if(existAccount) {
      newAccount = existAccount;
    };
    const accessToken = jwtService.createAccessToken(
      newAccount.id,
      newAccount.role,
    );
    const refreshToken = jwtService.createRefreshToken(
      newAccount.id,
      newAccount.role,
    );
    //Lưu refresh token vào redis
    await this.saveRefreshToken(accessToken, refreshToken);
    return {accessToken, refreshToken};
  }
}
const authService = new AuthService();
export default authService;
