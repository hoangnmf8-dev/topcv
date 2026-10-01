import { z } from "zod";
const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
export const cvTemplateSchema = z.enum([
  "modern",
  "classic",
  "minimal",
  "executive",
  "tech",
  "creative",
  "sales",
  "graduate",
  "ats",
]);
export const cvThemeSchema = z.enum(["emerald", "navy", "purple", "slate"]);
export const cvDataSchema = z
  .object({
    personal: z
      .object({
        avatarKey: text(500).optional(),
        fullName: text(30).min(1, "Vui lòng nhập họ tên"),
        title: text(50).min(1, "Vui lòng nhập chức danh"),
        phone: text(25).refine(
          (v) =>
            /^(?:0|\+84)(?:[35789]\d{8}|2\d{9})$/.test(
              v.replace(/[\s().-]/g, ""),
            ),
          "Số điện thoại Việt Nam không hợp lệ",
        ),
        email: text(254).email("Email không đúng định dạng"),
        address: text(255),
        github: text(500),
        linkedin: text(500),
      })
      .strict(),
    objective: text(500),
    experiences: z
      .array(
        z
          .object({
            id: text(100).min(1),
            company: text(255),
            role: text(50),
            timeline: text(100),
            bullets: z.array(text(500)).max(30).refine(lines => lines.join("\n").length <= 500, "Mô tả công việc tối đa 500 ký tự"),
          })
          .strict(),
      )
      .max(30),
    educations: z
      .array(
        z
          .object({
            id: text(100).min(1),
            school: text(255),
            degree: text(255),
            timeline: text(100),
          })
          .strict(),
      )
      .max(30),
    skills: z
      .array(
        z
          .object({
            id: text(100).min(1),
            name: text(100),
            level: z.number().int().min(1).max(5),
          })
          .strict(),
      )
      .max(50),
  })
  .strict();
export const cvSaveSchema = z
  .object({
    title: text(255).min(1, "Vui lòng nhập tên CV"),
    templateCode: cvTemplateSchema,
    contentJson: cvDataSchema.extend({ theme: cvThemeSchema }),
    isDefault: z.boolean().optional(),
  })
  .strict();
export const cvCreateSchema = cvSaveSchema.extend({ id: z.string().uuid() });
export const cvIdSchema = z.string().uuid();
export const cvFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên CV")
    .max(255, "Tên CV tối đa 255 ký tự"),
  templateCode: cvTemplateSchema,
  theme: cvThemeSchema,
  data: cvDataSchema.extend({
    personal: cvDataSchema.shape.personal.extend({ avatar: z.string() }),
  }),
});
export type CvFormValues = z.infer<typeof cvFormSchema>;
export const cvImageSchema = z
  .custom<File>(
    (v) => typeof File !== "undefined" && v instanceof File,
    "Vui lòng chọn ảnh",
  )
  .refine(
    (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    "Chỉ nhận ảnh JPG, PNG hoặc WebP",
  )
  .refine(
    (f) => f.size > 0 && f.size <= 5 * 1024 * 1024,
    "Ảnh phải nhỏ hơn hoặc bằng 5 MB",
  );
