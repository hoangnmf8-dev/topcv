import uploadService from "@/services/upload.service";
import authService from "@/services/auth.service";
import { AccountState } from "@/types";
import { create } from "zustand";
import { useCompanyStore } from "./company.store";

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  setAccount: async () => {
    try {
      const profileResponse = await authService.getProfile();
      if (profileResponse.data.candidate?.avatarKey) {
        const avatarUrl = await uploadService.getUrlFile(profileResponse.data.candidate.avatarKey);
        profileResponse.data.candidate.avatarUrl = typeof avatarUrl === "string" ? avatarUrl : null;
      }
      set({ account: profileResponse.data })
      if(profileResponse.data.company) {
        useCompanyStore.getState().setCompany(profileResponse.data.company)
      }
      return profileResponse.data;
    } catch(error) {
      return Promise.reject(error);
    }
  },
  updateCandidate: (data) => set((state) => {
    if (!state.account?.candidate) return state;
    return { account: { ...state.account, candidate: { ...state.account.candidate, ...data } } };
  }),
  updateCompany: (companyData) =>
    set((state) => {
      if (!state.account || !state.account.company) return state;
      return {
        account: {
          ...state.account,
          company: {
            ...state.account.company,
            ...companyData,
          },
        },
      };
    }),
  reset: () => set({ account: null }),
}));
