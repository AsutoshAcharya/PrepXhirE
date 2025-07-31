import * as z from "zod";
import { JobTitle } from "../../models/user.model";
import { Difficulty } from "../../models/mcq.model";

export const createMcqSchema = z.object({
  jobTitle: z.enum(JobTitle),
  difficulty: z.enum(Difficulty),
  question: z.string().min(5).max(500),
  options: z.array(z.string()).min(4).max(4),
  correctIndex: z.number(),
  explanation: z.string().optional(),
});

export type CreateMcqDto = z.infer<typeof createMcqSchema>;
