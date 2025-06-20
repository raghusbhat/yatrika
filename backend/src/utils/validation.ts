// Zod schemas for clarification loop
import { z } from "zod";

export const ClarifyInputSchema = z.object({
  input: z.string(), // User's initial input (text or image URL)
});

export type ClarifyInput = z.infer<typeof ClarifyInputSchema>;

export const ClarificationStateSchema = z.object({
  destination: z.string().optional(),
  groupType: z.string().optional(),
  tripTheme: z.string().optional(),
  budget: z.string().optional(),
  interests: z.array(z.string()).optional(),
  inputHistory: z.array(z.string()),
  isPlanReady: z.boolean(),
});

export type ClarificationState = z.infer<typeof ClarificationStateSchema>;
