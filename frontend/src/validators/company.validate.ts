import { UPLOAD } from "@/constants/upload.constant";
import * as z from "zod";
const imageSchema = (maxMB: number, type: "logo" | "banner") =>
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

const optionalImageSchema = (maxBytes: number, type: "logo" | "banner") =>
  z.preprocess((value) => {
    if (value == null) return undefined;
    if (typeof FileList !== "undefined" && value instanceof FileList) {
      return value.item(0) ?? undefined;
    } 
    return value;
  }, imageSchema(maxBytes, type).optional());
export const companyProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .max(200, "Tối đa 200 kí tự"),
  phone: z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .refine((value) => {
      if (!value) return true;
      const normalized = value.replace(/[\s().-]/g, "");
      return /^\+?[0-9]{9,15}$/.test(normalized);
    }, "Không đúng định dạng"),
  website: z
    .string()
    .trim()
    .max(2048, "Địa chỉ website quá dài")
    .refine(
      (value) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          return ["http:", "https:"].includes(url.protocol);
        } catch {
          return false;
        }
      },
      { message: "Website phải có dạng https://example.com" },
    )
    .optional(),
  taxCode: z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .max(20, "Tối đa 20 kí tự"),
  sizeRange: z.string().optional(),
  address: z.string().trim().max(300, "Địa chỉ tối đa 300 ký tự"),
  description: z
    .string()
    .trim()
    .max(2000, "Giới thiệu doanh nghiệp tối đa 2.000 ký tự")
    .optional(),
  logo: optionalImageSchema(UPLOAD.IMAGE_SIZE, "logo"),
  banner: optionalImageSchema(UPLOAD.IMAGE_SIZE, "banner"),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});
export type CompanyProfile = z.infer<typeof companyProfileSchema>;
export type CompanyProfileInput = z.input<typeof companyProfileSchema>;
