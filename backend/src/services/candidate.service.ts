import { ERROR_CODE } from "../constants/code.constant";
import { ERROR_MESSAGE } from "../constants/message.constant";
import { AccountNotFoundError } from "../exceptions";
import { CandidateInfoRegister } from "../types/auth.type";
import { CandidateUpdate } from "../types/candidate.type";
import { hashString } from "../utils/hashing";
import { prisma } from "../utils/prisma";

class CandidateService {
  async createCandidate(candidateInfo: CandidateInfoRegister) {
    const {fullName, email, phone, password, confirmPassword, role} = candidateInfo;
    return await prisma.$transaction(async (tx) => {
      const newCandidateAccount = await prisma.account.create({
        data: {
          email,
          role: "candidate", 
          passwordHash: hashString(password!)
        }
      });
      const newCandidateProfile = await prisma.candidate.create({
        data: {
          phone,
          fullName,
          accountId: newCandidateAccount.id
        }
      });
      return newCandidateAccount;
    });
  };
  async updateCandidate(id: string, data: CandidateUpdate) {
    const candidate = await prisma.candidate.findUnique({
      where: {
        id,
        deletedAt: null
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
        ...data
      }
    })
    return newCandidate
  };
};
const candidateService = new CandidateService();
export default candidateService;