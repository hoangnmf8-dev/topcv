import { z } from "zod";

export const googleStartSchema = z.object({
  role: z.enum(["candidate", "company"]).default("candidate"),
  state: z.string().regex(/^[a-f0-9]{64}$/),
});

export const googleCallbackSchema = z.object({
  code: z.string().min(1).max(4096),
  state: z.string().regex(/^[a-f0-9]{64}$/),
});
