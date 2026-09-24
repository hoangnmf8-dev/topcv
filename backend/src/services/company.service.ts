import { CompanyInfoRegister } from "../types/auth.type";
import { CompanyDataUpdate } from "../types/company.type";
import createCode from "../utils/code";
import { hashString } from "../utils/hashing";
import { prisma } from "../utils/prisma";
import uploadService from "./upload.service";

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
  async getCompanies(params: {page: number, limit: number}) {
    const companies = await prisma.company.findMany({
      take: +params.limit,
      skip: +(params.page - 1) * +params.limit
    });
    const urls = new Map<string, string>();
    await Promise.all(
      [
        ...new Set(
          companies
          .map((company) => company.logoKey)
          .filter((key): key is string => !!key),
        ),
      ].map(async (key) => {
        urls.set(key, await uploadService.createImageUrl(key));
      }),
    );
    return companies.map(company => ({
      ...company,
      logoUrl: company.logoKey ? urls.get(company.logoKey) : null
    }))
  };
  async getDetailCompany(code: string) {
    const company = await prisma.company.findUnique({
      where: {
        code
      }
    });
    return {
      ...company, 
      logoUrl: company?.logoKey ? await uploadService.createImageUrl(company.logoKey) : null
    }
  }
};
const companyService = new CompanyService();
export default companyService;