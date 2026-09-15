export interface HTTPError extends Error {
  status: number;
};
export interface CandidateInfoRegister {
  role: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};
export interface CompanyInfoRegister {
  role: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};
export interface LoginInfo {
  email: string;
  password: string;
}