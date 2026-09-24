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
export interface Candidate {
  id: string;
  accountId: string;
  fullName: string;
  headline: string | null;
  careerGoal: string | null;
  experienceYears: string | null; 
  profileCompletion: number;
  isSearchable: boolean;
  avatarKey: string;
  avatarUrl: string | null;
  currentLocationId: string | number | null; 
  phone: string | null;
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
  setAccount: () => Promise<AccountResponse>;
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
export interface CandidateStore {
  candidate: null | Candidate,
  setCandidate: (candidate: Candidate) => void,
  updateCandidate: (candidate: Candidate) => void,
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
};
export interface Provice {
  code: string;
  fullName: string;
  id: string;
  name: string;
};
export interface JobCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export interface TopJob {
  code: string;
  name: string;
  _count: {
    jobPosts: number;
  }
}

export type Job = {
  id: string;
  title: string;
  salaryMin: number | string | null;
  salaryMax: number | string | null;
  currency: string | null;
  employmentType: string | null;
  deadlineAt: string | null;
  experienceYearsMin: number | string | null;
  isBoosted: boolean;
  createdAt: string;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  company?: { name: string; logoUrl?: string; sizeRange?: string; website?: string; address?: string; description?: string };
  location?: { name: string };
  category?: { name: string };
};

export type JobCardData = {
  id: string;
  title: string;
  company: string;
  logo: string;
  salary: string;
  salaryMin: number;
  location: string;
  district: string;
  deadline: string;
  experience: string;
  jobType: string;
  category: string;
  tags: string[];
  hot: boolean;
  updatedAt: string;
  description: string[];
  requirements: string[];
  benefits: string[];
  company_info: { size: string; field: string; website: string; address: string; about: string };
};

export type SavedCvOption = {
  value: string;
  label: string;
};
