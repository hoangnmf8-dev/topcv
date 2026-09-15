import { z } from "zod";

export const presignUploadSchema = z.object({
  purpose: z.enum(["avatar", "companyLogo", "companyBanner", "cv"]),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1, "Không có dữ liệu"),
  fileSize: z.number().int().positive(),
});

export const completeUploadSchema = z.discriminatedUnion("purpose", [
  z.object({
    purpose: z.literal("cv"),
    objectKey: z.string().min(1).max(500),
    title: z.string().trim().min(1).max(255),
    isDefault: z.boolean().optional(),
  }),
  z.object({
    purpose: z.enum(["avatar", "companyLogo", "companyBanner"]),
    objectKey: z.string().min(1).max(500),
  }),
]);

export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
