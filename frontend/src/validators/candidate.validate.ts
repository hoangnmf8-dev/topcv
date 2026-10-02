import { UPLOAD } from "@/constants/upload.constant";
import * as z from "zod";
const imageSchema = (maxMB: number, type: "avatar") =>
  z
    .custom<File>(
      (value) => typeof File !== "undefined" && value instanceof File,
      { message: `Vui lòng chọn file ảnh cho ${type}` },
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      { message: "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP" },
    )
    .refine((file) => file.size <= maxMB, {
      message: `Ảnh không được vượt quá ${maxMB} MB`,
    });

const optionalImageSchema = (maxBytes: number, type: "avatar") =>
  z.preprocess((value) => {
    if (value == null) return undefined;
    if (typeof FileList !== "undefined" && value instanceof FileList) {
      return value.item(0) ?? undefined;
    }
    return value;
  }, imageSchema(maxBytes, type).optional());
export const candidateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .max(150, "Tối đa 150 kí tự"),
  phone: z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .refine((value) => {
      if (!value) return true;
      const normalized = value.replace(/[\s().-]/g, "");
      return /^\+?[0-9]{9,15}$/.test(normalized);
    }, "Không đúng định dạng"),
  headline: z.string().trim().max(255, "Tối đa 255 kí tự").optional(),
  experienceYears: z
    .number()
    .int("Phải là số nguyên không âm")
    .min(0).max(80)
    .optional(),
  address: z.string().trim().max(300, "Địa chỉ tối đa 300 ký tự").optional(),
  isSearchable: z.boolean(),
  careerGoal: z.string().trim().max(2000, "Tối đa 2.000 ký tự").optional(),
  avatar: optionalImageSchema(UPLOAD.IMAGE_SIZE, "avatar"),
  avatarUrl: z.string().optional(),
});
export type CandidateInput = z.input<typeof candidateProfileSchema>;