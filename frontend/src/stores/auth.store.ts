import uploadService from "@/services/upload.service";
import authService from "@/services/auth.service";
import { AccountState } from "@/types";
import { create } from "zustand";
import { useCompanyStore } from "./company.store";
import { useCandidateStore } from "./candidate.store";

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  setAccount: async () => {
    try {
      const profileResponse = await authService.getProfile();
      set({ account: profileResponse.data });
      if (profileResponse.data.company) {
        useCompanyStore.getState().setCompany(profileResponse.data.company);
      }
      if(profileResponse.data.candidate) {
        useCandidateStore.getState().setCandidate(profileResponse.data.candidate);
      }
      return profileResponse.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  updateCandidate: (data) =>
    set((state) => {
      if (!state.account?.candidate) return state;
      return {
        account: {
          ...state.account,
          candidate: { ...state.account.candidate, ...data },
        },
      };
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
