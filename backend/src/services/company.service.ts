import { CompanyInfoRegister } from "../types/auth.type";
import { CompanyDataUpdate } from "../types/company.type";
import createCode from "../utils/code";
import { hashString } from "../utils/hashing";
import { prisma } from "../utils/prisma";

class CompanyService {
  async createCompany(companyInfo: CompanyInfoRegister) {
    const {fullName: name, email, phone, password, confirmPassword, role} = companyInfo;
    return await prisma.$transaction(async (tx) => {
      const newCompanyAccount =  await tx.account.create({
        data: {
          email,
          passwordHash: hashString(password!),
          role: "company"
        }
      });
      const newCompanyProfile = await tx.company.create({
        data: {
          code: createCode(name),
          phone,
          name,
          accountId: newCompanyAccount.id
        }
      });
      return newCompanyAccount;
    })
  };
  async updateCompany(id: string, data: CompanyDataUpdate) {
    return await prisma.company.update({
      where: {
        id
      }, 
      data: {
        ...data
      }
    }
    )
    
  };
};
const companyService = new CompanyService();
export default companyService;