import authService from "@/services/auth.service";
import { useAccountStore } from "./auth.store";
import { AccountState, Company, CompanyStore } from "@/types";
import { create } from "zustand";
import uploadService from "@/services/upload.service";

export const useCompanyStore = create<CompanyStore>((set) => ({
  company: null,
  setCompany: async (companyData: Company) => {
    let logoUrl, bannerUrl;
    if(companyData.logoKey) {
      logoUrl = await uploadService.getUrlFile(companyData.logoKey);
    }
    if(companyData.bannerKey) {
      bannerUrl = await uploadService.getUrlFile(companyData.bannerKey);
    }
    return set({company: {
      ...companyData,
      logoUrl,
      bannerUrl
    }})
  },
  updateCompany: (data) =>
    set((state) => {
      if (!state.company) return state;
      return {
        company: {
          ...data,
        },
      };
    }),
  reset: () => set({ company: null }),
}));
