import * as z from "zod";
import { JobTitle } from "../../enums";
const mcqRoundSchema = z.object({
  roundTime: z.number().max(120), //minutes
  questionIds: z.array(z.string()).min(5).max(15),
});
export const hostedSessionSchema = z.object({
  title: z.string().min(6).max(35),
  jobTitle: z.enum(JobTitle),
  jobLocation: z.string().max(35),
  organizationName: z.string().max(35),
  isPublic: z.boolean(),
  rounds: {
    mcq: z.boolean().optional(),
    coding: z.boolean().optional(),
    interview: z.boolean().optional(),
  },
  expireDate: z.date(),
  mcq: mcqRoundSchema.optional(),
  candidates: z.array(z.string()),
  access: {
    inviteCode: z.string().max(15).optional(),
    maxCandidates: z.number().max(50).optional(),
  },
});

export type McqRoundDto = z.infer<typeof mcqRoundSchema>;
