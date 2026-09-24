import { CandidateInfoRegister } from "../types/auth.type";
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
  async updateCandidate() {

  };
};
const candidateService = new CandidateService();
export default candidateService;