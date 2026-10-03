import createCode from "../utils/code";
import completionService from "./profile-completion.service";
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
import { ROTATE_SESSION, refreshRetryKey } from "./refresh-session";

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
      throw new BadRequest(
        ERROR_MESSAGE.AUTH_SERVICE.OTP_INVALID,
        ERROR_CODE.AUTH_SERVICE.OTP_INVALID,
      );
    }
    if (!verifyString(otp, otpHash)) {
      throw new BadRequest(
        ERROR_MESSAGE.AUTH_SERVICE.OTP_INVALID,
        ERROR_CODE.AUTH_SERVICE.OTP_INVALID,
      );
    }
    await prisma.account.update({
      where: {
        id: newAccount.id,
      },
      data: {
        verifyEmail: true,
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
    const existProfile = await prisma.account.findFirst({
      where: {
        id: accountId,
        status: "active",
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            phone: true,
            logoKey: true,
            bannerKey: true,
            address: true,
            sizeRange: true,
            verificationStatus: true,
            location: {
              select: {
                id: true,
                code: true,
                name: true,
                fullName: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarKey: true,
            headline: true,
            address: true,
            isSearchable: true,
            currentLocation: {
              select: {
                id: true,
                code: true,
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
    if (existProfile?.candidate) {
      const completion = await completionService.get(existProfile.id);
      const profile = await prisma.candidate.findUnique({
        where: { id: existProfile.candidate.id },
      });
      return {
        ...existProfile,
        candidate: {
          ...profile,
          ...existProfile.candidate,
          profileCompletion: completion.percentage,
        },
      };
    }
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
    const invalid = () =>
      new Unauthorized(
        ERROR_MESSAGE.AUTH_SERVICE.INVALID_TOKEN,
        ERROR_CODE.AUTH_SERVICE.INVALID_TOKEN,
      );
    let decodedRefreshToken: JwtPayload;
    try {
      decodedRefreshToken = jwtService.verifyRefreshToken(
        refreshToken,
      ) as JwtPayload;
      if (!decodedRefreshToken.accountId || !decodedRefreshToken.jti)
        throw invalid();
    } catch {
      throw invalid();
    }
    const account = await prisma.account.findFirst({
      where: {
        id: decodedRefreshToken.accountId,
        status: "active",
        deletedAt: null,
      },
      select: { id: true, role: true },
    });
    if (!account) {
      throw new Unauthorized(
        ERROR_MESSAGE.AUTH_SERVICE.INVALID_TOKEN,
        ERROR_CODE.AUTH_SERVICE.INVALID_TOKEN,
      );
    }
    const newAccessToken = jwtService.createAccessToken(
      decodedRefreshToken.accountId,
      account.role,
    );
    const newRefreshToken = jwtService.createRefreshToken(
      decodedRefreshToken.accountId,
      account.role,
    );
    const nextRefresh = jwtService.decodeToken(newRefreshToken) as JwtPayload;
    const nextAccess = jwtService.decodeToken(newAccessToken) as JwtPayload;
    const result = await redisClient.eval(ROTATE_SESSION, {
      keys: [
        `refreshToken:${account.id}:${decodedRefreshToken.jti}`,
        `refreshToken:${account.id}:${nextRefresh.jti}`,
        refreshRetryKey(refreshToken),
      ],
      arguments: [
        JSON.stringify({
          access: nextAccess.jti,
          refresh: nextRefresh.jti,
          accountId: account.id,
          role: account.role,
        }),
        String(Math.max(1, nextRefresh.exp - Math.floor(Date.now() / 1000))),
        JSON.stringify({ newAccessToken, newRefreshToken }),
      ],
    });
    if (typeof result !== "string") throw invalid();
    return JSON.parse(result) as {
      newAccessToken: string;
      newRefreshToken: string;
    };
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
    role: "candidate" | "company",
    authoritativeEmail: boolean,
    googleSubject: string,
  ) {
    const account = await prisma.$transaction(async (tx) => {
      const linked = await tx.account.findUnique({ where: { googleSubject } });
      const existing =
        linked ?? (await tx.account.findUnique({ where: { email } }));
      if (existing) {
        if (
          existing.deletedAt ||
          existing.status !== "active" ||
          !["candidate", "company"].includes(existing.role)
        ) {
          throw new AccountBlockedError(
            "Tài khoản không được phép đăng nhập",
            "GOOGLE_ACCOUNT_BLOCKED",
          );
        }
        if (
          !linked &&
          (!authoritativeEmail ||
            (existing.googleSubject &&
              existing.googleSubject !== googleSubject))
        )
          throw new BadRequest(
            "Vui lòng đăng nhập bằng mật khẩu cho email này",
            "GOOGLE_EMAIL_LINK_DENIED",
          );
        return tx.account.update({
          where: { id: existing.id },
          data: { googleSubject, verifyEmail: true, lastLoginAt: new Date() },
        });
      }
      const fullName = name.trim().slice(0, 150) || email.split("@")[0]!;
      return tx.account.create({
        data: {
          email,
          role,
          googleSubject,
          passwordHash: hashString(
            cryptoRandomString({ length: 64, type: "url-safe" }),
          ),
          verifyEmail: true,
          lastLoginAt: new Date(),
          ...(role === "candidate"
            ? { candidate: { create: { fullName } } }
            : {
                company: {
                  create: { name: fullName, code: createCode(fullName) },
                },
              }),
        },
      });
    });
    const accessToken = jwtService.createAccessToken(account.id, account.role);
    const refreshToken = jwtService.createRefreshToken(
      account.id,
      account.role,
    );
    await this.saveRefreshToken(accessToken, refreshToken);
    return { accessToken, refreshToken, role: account.role };
  }
}
const authService = new AuthService();
export default authService;
