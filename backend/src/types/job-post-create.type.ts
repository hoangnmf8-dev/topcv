import { z } from "zod";
const tags = z.array(z.string().trim().min(1).max(200)).max(50);
const salary = z.number().finite().nonnegative().max(9999999999999).nullable();
export const jobPostCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  jobCategoryId: z.string().uuid(),
  jobTitleId: z.string().uuid(),
  provinceId: z.string().uuid(),
  wardId: z.string().uuid(),
  address: z.string().trim().min(1).max(1000),
  salaryMin: salary,
  salaryMax: salary,
  currency: z.enum(["VND", "USD"]),
  experienceYearsMin: z.number().int().min(0).max(99).nullable(),
  deadlineAt: z.string().datetime({ offset: true }).refine(value => Date.parse(value) > Date.now(), "Hạn nhận hồ sơ phải ở tương lai"),
  overview: z.object({ requirements: tags, specialties: tags }),
  description: z.string().trim().min(1).max(50000),
  requirements: z.string().trim().min(1).max(50000),
  benefits: z.string().trim().min(1).max(50000),
}).refine(data => data.salaryMin === null || data.salaryMax === null || data.salaryMin <= data.salaryMax, {
  message: "Lương tối thiểu không được vượt mức tối đa", path: ["salaryMax"],
});
