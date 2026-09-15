import * as z from "zod";
export const COMPANY_SIZE_OPTIONS = [
  { value: "UNDER_10", label: "Dưới 10 nhân sự" },
  { value: "FROM_10_TO_99", label: "10 – 99 nhân sự" },
  { value: "FROM_100_TO_499", label: "100 – 499 nhân sự" },
  { value: "FROM_500_TO_999", label: "500 – 999 nhân sự" },
  { value: "FROM_1000", label: "Từ 1.000 nhân sự" },
] as const;
export const CITY_OPTIONS = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
] as const;
const imageSchema = (maxMB: number) =>
  z
    .custom<File>(
      (value) => typeof File !== "undefined" && value instanceof File,
      { message: "Vui lòng chọn file ảnh" },
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      { message: "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP" },
    )
    .refine((file) => file.size <= maxMB, {
      message: `Ảnh không được vượt quá ${maxMB} MB`,
    });
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
    }),
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
  tax: z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .max(20, "Tối đa 20 kí tự"),
  size: z
    .enum([
      "UNDER_10",
      "FROM_10_TO_99",
      "FROM_100_TO_499",
      "FROM_500_TO_999",
      "FROM_1000",
    ])
    .or(z.literal(""))
    .optional(),
  address: z.string().trim().max(300, "Địa chỉ tối đa 300 ký tự"),
  description: z
    .string()
    .trim()
    .max(2000, "Giới thiệu doanh nghiệp tối đa 2.000 ký tự")
    .optional(),
  logo: imageSchema(5).optional(),
  banner: imageSchema(5).optional(),
});
export type CompanyProfile = z.infer<typeof companyProfileSchema>;