import { z } from "zod";
export const applicationIdSchema = z.string().uuid();
export const applicationCreateSchema = z.object({ jobPostId: z.string().uuid(), cvId: z.string().uuid(), coverLetter: z.string().trim().max(3000).default("") }).strict();
