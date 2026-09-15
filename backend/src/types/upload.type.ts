export const uploadPurposes = [
  "avatar",
  "companyLogo",
  "companyBanner",
  "cv",
] as const;

export type UploadPurpose =
  (typeof uploadPurposes)[number];

export interface PresignUploadInput {
  purpose: UploadPurpose;
  fileName: string;
  contentType: string;
  fileSize: number;
}