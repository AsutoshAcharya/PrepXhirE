import * as z from "zod";
import { JobTitle } from "../../models/user.model";

import { Difficulty, Mode } from "../../enums";

export const createMcqSchema = z.object({
  jobTitle: z.enum(JobTitle),
  difficulty: z.enum(Difficulty),
  question: z.string().min(5).max(500),
  options: z.array(z.string()).min(4).max(4),
  correctIndex: z.number(),
  explanation: z.string().optional(),
  questionTopic: z.string(),
});

export const generateMcqQuerySchema = z.object({
  difficulty: z.enum(Difficulty),
  jobTitle: z.enum(JobTitle),
  skills: z.array(z.string()).min(1),
  questionCount: z.number().max(15).optional(),
});

export const userResponseSchema = z.object({
  questionId: z.string(),
  selectedIndex: z.number().min(0).max(3),
});

export const submitSchema = z.object({
  sessionId: z.string().optional(),
  mode: z.enum(Mode),
  timeTaken: z.number(), //will subtract it from current time to get startedAt
  responses: z.array(userResponseSchema).min(1),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;

export type CreateMcqDto = z.infer<typeof createMcqSchema>;
