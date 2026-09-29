import { z } from "zod";

const numberValue = z
  .union([z.string().trim().min(1), z.number()])
  .transform((value) => Number(value))
  .pipe(z.number().finite().nonnegative());
const optionalNumber = z.preprocess(
  (value) => (value == null || value === "" ? undefined : value),
  numberValue.optional(),
);
const ids = z.preprocess(
  (value) => (value == null ? [] : Array.isArray(value) ? value : [value]),
  z
    .array(z.string().uuid())
    .max(500)
    .transform((values) => [...new Set(values)]),
);

export const jobPostQuerySchema = z.object({
  page: numberValue.pipe(z.number().int().min(1)).default(1),
  limit: numberValue.pipe(z.number().int().min(1).max(100)).default(8),
  sort: z.enum(["newest", "salary", "hot"]).default("newest"),
  query: z.string().trim().max(200).optional(),
  employmentType: z
    .enum(["full_time", "part_time", "remote", "hybrid"])
    .optional(),
  experienceYearsMin: optionalNumber,
  saturdaySchedule: z.enum(["WORK", "OFF", "UNSPECIFIED"]).optional(),
  jobTitleIds: ids,
  provinceIds: ids,
  wardIds: ids,
  salary: z
    .object({
      min: optionalNumber,
      max: optionalNumber,
    })
    .refine(({ min, max }) => min == null || max == null || min <= max, {
      message: "Lương tối thiểu không được vượt lương tối đa",
      path: ["max"],
    })
    .optional(),
});

export type JobPostListQuery = z.infer<typeof jobPostQuerySchema>;
