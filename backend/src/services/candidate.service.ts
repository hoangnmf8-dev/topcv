import { ERROR_CODE } from "../constants/code.constant";
import { ERROR_MESSAGE } from "../constants/message.constant";
import { AccountNotFoundError } from "../exceptions";
import { CandidateInfoRegister } from "../types/auth.type";
import { CandidateUpdate } from "../types/candidate.type";
import { hashString } from "../utils/hashing";
import { prisma } from "../utils/prisma";
import type { z } from "zod";
import type { candidateUpdateSchema } from "../validators/candidate.validate";

class CandidateService {
  async createCandidate(candidateInfo: CandidateInfoRegister) {
    const {fullName, email, phone, password, confirmPassword, role} = candidateInfo;
    return await prisma.$transaction(async (tx) => {
      const newCandidateAccount = await tx.account.create({
        data: {
          email,
          role: "candidate", 
          passwordHash: hashString(password!)
        }
      });
      const newCandidateProfile = await prisma.candidate.create({
        data: {
          phone: phone ?? null,
          fullName,
          accountId: newCandidateAccount.id
        }
      });
      return newCandidateAccount;
    });
  };
  async updateCandidate(id: string, data: z.infer<typeof candidateUpdateSchema>, accountId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: {
        id,
        deletedAt: null,
        accountId,
        account: { role: "candidate", status: "active", deletedAt: null }
      }
    });
    if(!candidate) {
      throw new AccountNotFoundError(ERROR_MESSAGE.ACCOUNT_NOT_FOUND, ERROR_CODE.ACCOUNT_NOT_FOUND);
    };
    const newCandidate = await prisma.candidate.update({
      where: {
        id
      },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        isSearchable: data.isSearchable,
        ...(data.headline !== undefined ? {headline: data.headline} : {}),
        ...(data.experienceYears !== undefined ? {experienceYears: data.experienceYears} : {}),
        ...(data.address !== undefined ? {address: data.address} : {}),
        ...(data.careerGoal !== undefined ? {careerGoal: data.careerGoal} : {}),
      }
    })
    return newCandidate
  };
};
const candidateService = new CandidateService();
export default candidateService;
