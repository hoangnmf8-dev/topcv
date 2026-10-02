import { z } from "zod";
export const savedJobIdSchema = z.string().uuid();
