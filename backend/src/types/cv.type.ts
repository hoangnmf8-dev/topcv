import type { z } from "zod";
import type { cvSaveSchema, cvCreateSchema } from "../validators/cv.validate";
export type CvSaveInput = z.infer<typeof cvSaveSchema>;
export type CvCreateInput = z.infer<typeof cvCreateSchema>;
