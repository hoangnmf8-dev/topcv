import { Candidate, CandidateStore } from "@/types";
import { create } from "zustand";
import uploadService from "@/services/upload.service";

export const useCandidateStore = create<CandidateStore>((set) => ({
  candidate: null,
  setCandidate: async (candidateData: Candidate) => {
    let avatarUrl: string | null = null;
    if(candidateData.avatarKey) {
      avatarUrl = candidateData.avatarUrl || await uploadService.getUrlFile(candidateData.avatarKey);
    }
    return set({candidate: {
      ...candidateData,
      avatarUrl,
    }})
  },
  updateCandidate: (data) =>
    set((state) => {
      if (!state.candidate) return state;
      return {
        candidate: {
          ...data,
        },
      };
    }),
  reset: () => set({ candidate: null }),
}));
