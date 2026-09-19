export interface Company {
  id: string;
  accountId: string;
  name: string;
  code: string;
  verificationStatus: string;
  address: string | null;
  bannerKey: string | null;
  description: string | null;
  locationId: string | null;
  logoKey: string | null;
  phone: string | null;
  sizeRange: string | null;
  taxCode: string | null;
  verifiedAt: string | null;
  website: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
}
export interface CandidateProfile {
  avatarKey?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  headline?: string | null;
  careerGoal?: string | null;
}

export interface AccountResponse {
  candidate?: CandidateProfile | null;
  id: string;
  email: string;
  company: Company;
}
export interface AccountState {
  account: AccountResponse | null;
  setAccount: () => void;
  updateCandidate: (data: Partial<CandidateProfile>) => void;
  updateCompany: (companyData: Partial<Company>) => void;
  reset: () => void;
}
export interface CompanyStore {
  company: null | Company,
  setCompany: (companyData: Company) => void,
  updateCompany: (companyData: Company) => void,
  reset: () => void
}
export interface AppError extends Error{
  name: string;
  code: string;
  message: string;
}
export interface CompanyDataUpdate {
  name?: string;
  phone?: string;
  website?: string;
  taxCode?: string;
  address?: string;
  sizeRange?: string;
  description?: string;
}