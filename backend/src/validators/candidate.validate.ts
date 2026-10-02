import { z } from "zod";
export const candidateUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(150),
  phone: z.string().trim().refine(value => /^\+?\d{9,15}$/.test(value.replace(/[\s().-]/g, "")), "Số điện thoại không hợp lệ"),
  headline: z.string().trim().max(255).optional(),
  experienceYears: z.number().int().min(0).max(80).optional(),
  address: z.string().trim().max(300).optional(),
  careerGoal: z.string().trim().max(2000).optional(),
  isSearchable: z.boolean(),
}).strict();
