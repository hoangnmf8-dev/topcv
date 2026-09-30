import { getProfileAction } from "@/actions/auth.action";
import { AccountResponse, AccountState, Candidate } from "@/types";
import { create } from "zustand";
import { useCompanyStore } from "./company.store";
import { useCandidateStore } from "./candidate.store";

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  setAccount: async () => {
    try {
      const profileResponse = await getProfileAction();
      if (!profileResponse.success) {
        throw new Error(profileResponse.message);
      }
      const account = profileResponse.data as AccountResponse;
      set({ account });
      if (account.company) {
        useCompanyStore.getState().setCompany(account.company);
      }
      if (account.candidate) {
        // /auth/profile returns the candidate fields needed by the dashboard.
        // The detailed profile endpoint enriches the remaining optional fields later.
        useCandidateStore.getState().setCandidate(account.candidate as Candidate);
      }
      return account;
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
